import { createClient } from "npm:@supabase/supabase-js@2";
import { sanitizeGuardianSnapshot } from "../../../playlab/guardian-share-snapshot.js";

const ALLOWED_ORIGINS = new Set([
  "https://thehahalab.com",
  "https://www.thehahalab.com",
  "https://hahalab.pages.dev",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);
const SHARE_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

const corsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://thehahalab.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "private, no-store, max-age=0",
    "Referrer-Policy": "no-referrer",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Vary": "Origin",
  };
};

const json = (req: Request, body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(req) },
});

const serviceClient = () => createClient(
  String(Deno.env.get("SUPABASE_URL") || ""),
  String(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""),
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const toBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const createToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

const digestToken = async (token: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const normalizeSlug = (value: unknown) => {
  const normalized = String(value || "rehab-session")
    .toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 96);
  return normalized || "rehab-session";
};

const parseRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value !== "string" || !value.trim()) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch (_error) {
    return {};
  }
};

const readStoredReportInput = (history: Record<string, unknown>) => {
  const details = parseRecord(history.details);
  const metadata = parseRecord(history.metadata);
  const value = details.report_input || details.reportInput || metadata.report_input || metadata.reportInput;
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
};

const buildServerSnapshot = (history: Record<string, unknown>, reportInput: Record<string, unknown>) => sanitizeGuardianSnapshot({
  entry: {
    title: String(history.action_type || reportInput.stageTitle || reportInput.title || "재활랩 활동").slice(0, 200),
    subtitle: String(reportInput.title || "재활랩").slice(0, 200),
    playedAt: String(history.event_datetime || history.created_at || reportInput.completedAt || "").slice(0, 64),
    reportProfileId: String(reportInput.reportProfileId || reportInput.reportProfile || "").slice(0, 100),
    reportProfileLabel: String(reportInput.reportProfileLabel || "").slice(0, 160),
  },
  reportInput,
  provenance: {
    source: "stored-history-report-input",
    audienceScope: "guardian",
    generatedAt: new Date().toISOString(),
    reviewStatus: "automatic-unreviewed",
  },
});

const logAudit = async (admin: ReturnType<typeof serviceClient>, values: Record<string, unknown>) => {
  try {
    await admin.from("report_share_audit").insert(values);
  } catch (_error) {
    // Audit failure must not expose share-link internals or change the response.
  }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "METHOD_NOT_ALLOWED" }, 405);
  const admin = serviceClient();
  try {
    const body = await req.json() as Record<string, unknown>;
    const action = String(body?.action || "");
    if (action === "resolve") {
      const token = String(body?.token || "");
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return json(req, { error: "LINK_UNAVAILABLE" }, 404);
      const tokenDigest = await digestToken(token);
      const { data: link, error } = await admin
        .from("report_share_links")
        .select("id,owner_user_id,snapshot,expires_at,revoked_at,audience_scope,access_count")
        .eq("token_digest", tokenDigest)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!link) return json(req, { error: "LINK_UNAVAILABLE" }, 404);
      const expiresAt = new Date(link.expires_at).getTime();
      if (link.revoked_at || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        await admin.from("report_share_links").delete().eq("id", link.id);
        return json(req, { error: "LINK_EXPIRED" }, 410);
      }
      const { data: owner, error: ownerError } = await admin.from("teachers")
        .select("status").eq("auth_user_id", link.owner_user_id).limit(1).maybeSingle();
      if (ownerError) throw ownerError;
      if (!owner || !["normal", "active"].includes(String(owner.status || "").trim().toLowerCase())) {
        return json(req, { error: "LINK_UNAVAILABLE" }, 404);
      }
      await admin.from("report_share_links").update({
        last_accessed_at: new Date().toISOString(),
        access_count: Number((link as Record<string, unknown>).access_count || 0) + 1,
      }).eq("id", link.id);
      await logAudit(admin, { share_link_id: link.id, event_type: "viewed" });
      return json(req, { snapshot: sanitizeGuardianSnapshot(link.snapshot), expiresAt: link.expires_at, audienceScope: "guardian" });
    }

    if (!['create', 'revoke'].includes(action)) return json(req, { error: "ACTION_NOT_SUPPORTED" }, 400);
    const authHeader = req.headers.get("Authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!accessToken) return json(req, { error: "AUTH_REQUIRED", message: "다시 로그인해 주세요." }, 401);
    const { data: userResult, error: userError } = await admin.auth.getUser(accessToken);
    if (userError || !userResult?.user) return json(req, { error: "AUTH_REQUIRED", message: "다시 로그인해 주세요." }, 401);
    const authed = createClient(
      String(Deno.env.get("SUPABASE_URL") || ""),
      String(Deno.env.get("SUPABASE_ANON_KEY") || ""),
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data: sessionActive, error: sessionError } = await authed.rpc("security_session_active");
    if (sessionError || sessionActive !== true) {
      return json(req, { error: "AUTH_REQUIRED", message: "다시 로그인해 주세요." }, 401);
    }

    if (action === "revoke") {
      const token = String(body?.token || "");
      if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return json(req, { error: "LINK_UNAVAILABLE" }, 404);
      const tokenDigest = await digestToken(token);
      const { data: link } = await admin.from("report_share_links")
        .select("id").eq("token_digest", tokenDigest).eq("owner_user_id", userResult.user.id).limit(1).maybeSingle();
      if (!link) return json(req, { error: "LINK_UNAVAILABLE" }, 404);
      await logAudit(admin, { share_link_id: link.id, owner_user_id: userResult.user.id, event_type: "revoked" });
      const { error: deleteError } = await admin.from("report_share_links").delete().eq("id", link.id).eq("owner_user_id", userResult.user.id);
      if (deleteError) throw deleteError;
      return json(req, { revoked: true });
    }

    const clientId = String(body?.clientId || "").trim();
    const historyId = String(body?.historyId || "").trim();
    if (!clientId || !historyId) return json(req, { error: "TARGET_REQUIRED" }, 400);
    const { data: teacher, error: teacherError } = await admin
      .from("teachers").select("id,teacher_id,status").eq("auth_user_id", userResult.user.id).limit(1).maybeSingle();
    if (teacherError) throw teacherError;
    if (!teacher || !["normal", "active"].includes(String(teacher.status || "").trim().toLowerCase())) {
      return json(req, { error: "OWNER_NOT_FOUND" }, 403);
    }
    const tenantId = String(teacher.teacher_id || teacher.id || "");
    const [{ data: client, error: clientError }, { data: history, error: historyError }] = await Promise.all([
      admin.from("clients").select("id").eq("id", clientId).eq("teacher_id", tenantId).limit(1).maybeSingle(),
      admin.from("histories").select("id,client_id,details,metadata,action_type,event_datetime,created_at").eq("id", historyId).eq("client_id", clientId).eq("teacher_id", tenantId).limit(1).maybeSingle(),
    ]);
    if (clientError || historyError) throw clientError || historyError;
    if (!client || !history) return json(req, { error: "OWNER_MISMATCH" }, 403);

    const storedReportInput = readStoredReportInput(history as Record<string, unknown>);
    if (!storedReportInput) return json(req, { error: "REPORT_SOURCE_REQUIRED", message: "저장된 전문 리포트 원자료가 있는 회기만 공유할 수 있습니다." }, 409);
    if (JSON.stringify(storedReportInput).length > 900_000) return json(req, { error: "SNAPSHOT_TOO_LARGE" }, 413);
    const token = createToken();
    const tokenDigest = await digestToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SHARE_LIFETIME_MS).toISOString();
    const slug = normalizeSlug(body?.slug);
    const { data: link, error: insertError } = await admin.from("report_share_links").insert({
      owner_user_id: userResult.user.id,
      teacher_id: tenantId,
      client_id: clientId,
      history_id: historyId,
      audience_scope: "guardian",
      token_digest: tokenDigest,
      slug,
      snapshot: buildServerSnapshot(history as Record<string, unknown>, storedReportInput),
      expires_at: expiresAt,
    }).select("id").single();
    if (insertError) throw insertError;
    await logAudit(admin, { share_link_id: link.id, owner_user_id: userResult.user.id, event_type: "created" });
    return json(req, { token, slug, expiresAt, expiresInDays: 30 }, 201);
  } catch (error) {
    console.error("[report-share]", error instanceof Error ? error.message : String(error));
    return json(req, { error: "SHARE_REQUEST_FAILED", message: "공유 링크를 처리하지 못했습니다." }, 500);
  }
});
