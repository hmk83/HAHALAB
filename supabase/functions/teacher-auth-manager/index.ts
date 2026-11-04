import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://thehahalab.com",
  "https://www.thehahalab.com",
  "https://hahalab.pages.dev",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

const buildCorsHeaders = (req: Request) => {
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://thehahalab.com";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Vary": "Origin",
  };
};

const json = (req: Request, body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(req),
      ...(init.headers || {}),
    },
  });

const getRequiredEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`${key}_MISSING`);
  return value;
};

const createServiceClient = () => {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const createAuthedClient = (authHeader: string) => {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
  return createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const normalizeTeacherId = (value: unknown) =>
  String(value || "").trim();

const normalizeEmail = (value: unknown) =>
  String(value || "").trim().toLowerCase();

const normalizePhone = (value: unknown) => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("010")) {
    return `010-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return String(value || "").trim();
};

const normalizeName = (value: unknown) =>
  String(value || "").trim();

const normalizeCenter = (value: unknown) =>
  String(value || "").trim();

const isValidTeacherPassword = (value: string) =>
  /^(?=.*[!@#$%^&*()_+={}\[\]|\\:;"'<>,.?/~`\-]).{8,}$/.test(value);

const isValidTeacherName = (value: string) =>
  /^[가-힣]+$/.test(value);

const isValidTeacherPhone = (value: string) =>
  /^010-\d{4}-\d{4}$/.test(value);

const maskTeacherId = (value: unknown) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.length <= 2) return `${raw.slice(0, 1)}**`;
  return `${raw.slice(0, 2)}${"*".repeat(Math.max(3, Math.min(6, raw.length - 2)))}`;
};


const sha256Hex = async (value: string) => {
  const data = new TextEncoder().encode(value || "");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const getRequestIp = (req: Request) => {
  // Prefer Cloudflare's trusted header (cannot be spoofed by client)
  const cfIp = req.headers.get("cf-connecting-ip") || "";
  if (cfIp) return cfIp.trim();
  // Fallback: last entry in x-forwarded-for (set by the closest trusted proxy)
  const forwardedFor = req.headers.get("x-forwarded-for") || "";
  if (forwardedFor) {
    const parts = forwardedFor.split(",").map((s) => s.trim()).filter(Boolean);
    return parts[parts.length - 1] || "";
  }
  return req.headers.get("x-real-ip") || "";
};

// Defense in depth only. GoTrue enforces its own distributed auth/email limits;
// these bounded counters do not replace a gateway-wide limiter.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 20; // max requests per window per IP

const checkRateLimit = (key: string): boolean => {
  const now = Date.now();
  for (const [storedKey, entry] of rateLimitMap) {
    if (entry.resetAt <= now) rateLimitMap.delete(storedKey);
  }
  if (!rateLimitMap.has(key) && rateLimitMap.size >= 10_000) return false;
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return false;
  return true;
};

const isDuplicateKeyError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error || "");
  return msg.includes("duplicate key") || msg.includes("unique constraint") || msg.includes("23505");
};

const getTeacherById = async (admin: ReturnType<typeof createServiceClient>, teacherId: string) => {
  if (!teacherId) return null;
  const { data, error } = await admin
    .from("teachers")
    .select("id,auth_user_id,teacher_id,email,status,role,name,contact,center,withdrawn_at")
    .ilike("teacher_id", teacherId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

const getTeacherByAuthUserId = async (admin: ReturnType<typeof createServiceClient>, authUserId: string) => {
  const { data, error } = await admin
    .from("teachers")
    .select("id,auth_user_id,teacher_id,email,status,role,name,contact,center,withdrawn_at")
    .eq("auth_user_id", authUserId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
};

const getLatestTermDocs = async (admin: ReturnType<typeof createServiceClient>) => {
  const nowIso = new Date().toISOString();
  const [termsRes, privacyRes] = await Promise.all([
    admin
      .from("app_terms")
      .select("id,type,version,title,content,effective_at,created_at")
      .eq("type", "terms")
      .eq("is_active", true)
      .lte("effective_at", nowIso)
      .order("effective_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("app_terms")
      .select("id,type,version,title,content,effective_at,created_at")
      .eq("type", "privacy")
      .eq("is_active", true)
      .lte("effective_at", nowIso)
      .order("effective_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (termsRes.error) throw termsRes.error;
  if (privacyRes.error) throw privacyRes.error;
  if (!termsRes.data?.content || !privacyRes.data?.content) {
    throw new Error("TERMS_DOCS_MISSING");
  }

  return {
    terms: termsRes.data,
    privacy: privacyRes.data,
  };
};

const ensureAdmin = async (authHeader: string) => {
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("AUTH_REQUIRED");
  }

  const authed = createAuthedClient(authHeader);
  const { data: userResult, error: userError } = await authed.auth.getUser();
  if (userError || !userResult?.user) throw new Error("AUTH_REQUIRED");
  const { data: sessionActive, error: sessionError } = await authed.rpc("security_session_active");
  if (sessionError || sessionActive !== true) throw new Error("AUTH_REQUIRED");

  const { data: isAdmin, error: adminError } = await authed.rpc("is_admin_user");
  if (adminError) throw adminError;
  if (!isAdmin) throw new Error("ADMIN_ONLY");

  // Decode claims only after GoTrue has verified this exact bearer token.
  // Role authorization alone must not bypass the administrator MFA gate.
  let verifiedClaims: Record<string, unknown>;
  try {
    const encoded = authHeader.slice(7).split(".")[1] || "";
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    verifiedClaims = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
  } catch {
    throw new Error("MFA_REQUIRED");
  }
  if (verifiedClaims?.aal !== "aal2" || verifiedClaims?.sub !== userResult.user.id) {
    throw new Error("MFA_REQUIRED");
  }

  const teacher = await getTeacherByAuthUserId(createServiceClient(), userResult.user.id);
  if (!teacher || isBlockedAdminTeacher(teacher.status, teacher.withdrawn_at)) throw new Error("ACCOUNT_BLOCKED");

  return { authed, user: userResult.user };
};

const isBlockedTeacher = (status: unknown, withdrawnAt?: unknown) =>
  Boolean(withdrawnAt) || !["normal", "active", "pending", "pending_teacher"].includes(String(status || "").trim().toLowerCase());

const isBlockedAdminTeacher = (status: unknown, withdrawnAt?: unknown) =>
  Boolean(withdrawnAt) || !["normal", "active"].includes(String(status || "").trim().toLowerCase());

const checkSignupAvailability = async (
  admin: ReturnType<typeof createServiceClient>,
  teacherId: string,
  email: string,
  contact: string,
) => {
  const queries = await Promise.all([
    teacherId
      ? admin
        .from("teachers")
        .select("id")
        .ilike("teacher_id", teacherId)
        .limit(1)
      : Promise.resolve({ data: [], error: null }),
    email
      ? admin
        .from("teachers")
        .select("id")
        .eq("email", email)
        .limit(1)
      : Promise.resolve({ data: [], error: null }),
    contact
      ? admin
        .from("teachers")
        .select("id")
        .eq("contact", contact)
        .limit(1)
      : Promise.resolve({ data: [], error: null }),
  ]);

  queries.forEach((result) => {
    if (result.error) throw result.error;
  });

  return {
    teacherIdAvailable: teacherId ? !(queries[0].data && queries[0].data.length > 0) : true,
    emailAvailable: email ? !(queries[1].data && queries[1].data.length > 0) : true,
    contactAvailable: contact ? !(queries[2].data && queries[2].data.length > 0) : true,
  };
};

const saveTermsAgreement = async (
  admin: ReturnType<typeof createServiceClient>,
  req: Request,
  {
    teacherId,
    email,
    consentSource,
    consentScope,
    googleScopes,
    agreedAt,
    meta,
    locale,
    uiVersion,
    minorOrGuardianAcknowledgedAt,
  }: {
    teacherId: string;
    email: string;
    consentSource: string;
    consentScope?: Record<string, unknown>;
    googleScopes?: string[];
    agreedAt?: string;
    meta?: Record<string, unknown>;
    locale?: string;
    uiVersion?: string;
    minorOrGuardianAcknowledgedAt?: string | null;
  },
) => {
  const docs = await getLatestTermDocs(admin);
  const termsHash = await sha256Hex(String(docs.terms.content || ""));
  const privacyHash = await sha256Hex(String(docs.privacy.content || ""));
  const userAgent = req.headers.get("user-agent") || "";
  const ipAddress = getRequestIp(req);
  const normalizedSource = String(consentSource || "signup").trim() || "signup";
  const normalizedScope = consentScope && typeof consentScope === "object" ? consentScope : {};
  const normalizedMeta = meta && typeof meta === "object" ? meta : {};
  const normalizedGoogleScopes = Array.isArray(googleScopes) ? googleScopes.filter(Boolean) : [];
  const agreedAtValue = String(agreedAt || "").trim() || new Date().toISOString();
  const localeValue = String(locale || "ko-KR").trim() || "ko-KR";
  const uiVersionValue = String(uiVersion || "").trim() || "2026.03";

  const { data: existing, error: existingError } = await admin
    .from("app_terms_agreements")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("service_term_sha256", termsHash)
    .eq("privacy_term_sha256", privacyHash)
    .order("agreed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return existing;

  const insertPayload = {
    teacher_id: teacherId,
    email,
    service_term_id: String(docs.terms.id),
    privacy_term_id: String(docs.privacy.id),
    service_term_version: String(docs.terms.version || ""),
    privacy_term_version: String(docs.privacy.version || ""),
    service_term_title: String(docs.terms.title || "HAHA LAB 이용약관"),
    privacy_term_title: String(docs.privacy.title || "HAHA LAB 개인정보처리방침"),
    service_term_effective_at: docs.terms.effective_at || docs.terms.created_at || null,
    privacy_term_effective_at: docs.privacy.effective_at || docs.privacy.created_at || null,
    service_term_snapshot: String(docs.terms.content || ""),
    privacy_term_snapshot: String(docs.privacy.content || ""),
    service_term_sha256: termsHash,
    privacy_term_sha256: privacyHash,
    consent_source: normalizedSource,
    consent_scope: normalizedScope,
    google_scopes: normalizedGoogleScopes,
    agreed_at: agreedAtValue,
    user_agent: userAgent,
    locale: localeValue,
    ip_address: ipAddress,
    ui_version: uiVersionValue,
    minor_or_guardian_acknowledged_at: minorOrGuardianAcknowledgedAt || null,
    meta: {
      ...normalizedMeta,
      consent_source: normalizedSource,
      ui_version: uiVersionValue,
    },
  };

  const { error } = await admin
    .from("app_terms_agreements")
    .insert([insertPayload]);
  if (error) throw error;
  return { ok: true };
};

const applyTrialWindowIfNeeded = async (admin: ReturnType<typeof createServiceClient>, teacherId: string) => {
  const { data: trialSetting, error: trialError } = await admin
    .from("app_settings")
    .select("value")
    .eq("key", "free_trial_days")
    .limit(1)
    .maybeSingle();
  if (trialError) return;
  const settingValue = (trialSetting?.value && typeof trialSetting.value === "object")
    ? trialSetting.value as Record<string, unknown>
    : {};
  const trialMode = String(settingValue.mode || (settingValue.endDate ? "date" : "duration")).trim().toLowerCase();
  const endDate = trialMode === "date"
    ? new Date(`${String(settingValue.endDate || settingValue.end_date || "").trim()}T23:59:59`)
    : new Date();

  if (trialMode === "date") {
    if (Number.isNaN(endDate.getTime())) return;
  } else {
    const trialDays = Number(settingValue.days || 0);
    if (!trialDays || trialDays < 1) return;
    endDate.setDate(endDate.getDate() + trialDays);
  }
  endDate.setHours(23, 59, 59, 0);
  await admin
    .from("teachers")
    .update({ free_trial_end: endDate.toISOString() })
    .eq("teacher_id", teacherId);
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(req, { error: "METHOD_NOT_ALLOWED" }, { status: 405 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json(req, { error: "INVALID_JSON" }, { status: 400 });
  }

  const action = String(payload.action || "").trim();
  if (!action) {
    return json(req, { error: "ACTION_REQUIRED" }, { status: 400 });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const clientIp = getRequestIp(req);

  // Rate limit check for sensitive actions
  const rateLimitedActions = new Set(["create_user", "sign_in_teacher", "validate_signup", "update_password", "find_teacher_id", "request_password_reset"]);
  const accountKey = normalizeEmail(payload.email) || normalizeTeacherId(payload.teacherId).toLowerCase()
    || normalizePhone(payload.contact);
  if (rateLimitedActions.has(action) && (
    !checkRateLimit(`ip:${clientIp || "unavailable"}`)
    || (accountKey && !checkRateLimit(`account:${action}:${await sha256Hex(accountKey)}`))
  )) {
    return json(req, { error: "RATE_LIMITED" }, { status: 429 });
  }

  try {
    const admin = createServiceClient();

    if (action === "validate_signup") {
      await ensureAdmin(authHeader);
      const teacherId = normalizeTeacherId(payload.teacherId);
      const email = normalizeEmail(payload.email);
      const contact = normalizePhone(payload.contact);
      const availability = await checkSignupAvailability(admin, teacherId, email, contact);
      return json(req, { ok: true, availability });
    }

    if (action === "find_teacher_id") {
      const name = normalizeName(payload.name);
      const contact = normalizePhone(payload.contact);
      if (!name || !isValidTeacherPhone(contact)) {
        return json(req, { error: "INVALID_LOOKUP_FIELDS" }, { status: 400 });
      }

      const { data, error } = await admin
        .from("teachers")
        .select("teacher_id,status,withdrawn_at")
        .eq("name", name)
        .eq("contact", contact)
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      const blocked = isBlockedTeacher(data?.status, data?.withdrawn_at);
      return json(req, {
        ok: true,
        found: Boolean(data?.teacher_id && !blocked),
        maskedTeacherId: data?.teacher_id && !blocked ? maskTeacherId(data.teacher_id) : "",
      });
    }

    if (action === "request_password_reset") {
      const email = normalizeEmail(payload.email);
      const name = normalizeName(payload.name);
      const contact = normalizePhone(payload.contact);
      if (!email || !name || !isValidTeacherPhone(contact)) {
        return json(req, { error: "INVALID_LOOKUP_FIELDS" }, { status: 400 });
      }

      const { data: teacher, error } = await admin
        .from("teachers")
        .select("id,auth_user_id,teacher_id,email,name,contact,status,withdrawn_at")
        .eq("email", email)
        .eq("name", name)
        .eq("contact", contact)
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      // Use the same response for absent, blocked and eligible accounts.
      if (!teacher?.auth_user_id || isBlockedTeacher(teacher.status, teacher.withdrawn_at)) {
        return json(req, { ok: true, sent: true });
      }

      // GoTrue sends a single-use recovery link. The existing password and
      // password-change metadata stay unchanged until the recipient verifies it.
      const recovery = createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_ANON_KEY"), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: recoveryError } = await recovery.auth.resetPasswordForEmail(email, {
        redirectTo: "https://thehahalab.com/class-new.html",
      });
      if (recoveryError) console.error("[teacher-auth-manager] recovery delivery failed:", recoveryError.code || "RECOVERY_FAILED");

      return json(req, { ok: true, sent: true });
    }

    if (action === "create_user") {
      // Public registration is disabled. Only a verified active administrator
      // may provision accounts or omit the end user's agreement step.
      await ensureAdmin(authHeader);
      const isAdminProvision = true;
      const teacherId = normalizeTeacherId(payload.teacherId);
      const email = normalizeEmail(payload.email);
      const password = String(payload.password || "");
      const name = normalizeName(payload.name);
      const center = normalizeCenter(payload.center);
      const gender = String(payload.gender || "").trim();
      const contact = normalizePhone(payload.contact);
      const consentSource = String(payload.consentSource || "signup").trim() || "signup";
      const locale = String(payload.locale || "ko-KR").trim() || "ko-KR";
      const uiVersion = String(payload.uiVersion || "2026.03").trim() || "2026.03";
      const consentScope = payload.consentScope && typeof payload.consentScope === "object"
        ? payload.consentScope as Record<string, unknown>
        : {};
      const skipAgreement = Boolean(payload.skipAgreement);

      if (!teacherId || !email || !password || !name || !center || !gender || !contact) {
        return json(req, { error: "REQUIRED_FIELDS_MISSING" }, { status: 400 });
      }
      if (teacherId.length > 50 || email.length > 254 || password.length > 128 || name.length > 30 || center.length > 100 || contact.length > 20) {
        return json(req, { error: "INPUT_TOO_LONG" }, { status: 400 });
      }
      if (!isValidTeacherName(name)) {
        return json(req, { error: "INVALID_NAME" }, { status: 400 });
      }
      if (!isValidTeacherPhone(contact)) {
        return json(req, { error: "INVALID_CONTACT" }, { status: 400 });
      }
      if (!isValidTeacherPassword(password)) {
        return json(req, { error: "INVALID_PASSWORD" }, { status: 400 });
      }

      const availability = await checkSignupAvailability(admin, teacherId, email, contact);
      if (!availability.teacherIdAvailable) return json(req, { error: "DUPLICATE_TEACHER_ID" }, { status: 409 });
      if (!availability.emailAvailable) return json(req, { error: "DUPLICATE_EMAIL" }, { status: 409 });
      if (!availability.contactAvailable) return json(req, { error: "DUPLICATE_CONTACT" }, { status: 409 });

      if (!skipAgreement) {
        await getLatestTermDocs(admin);
      }

      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          app_role: "teacher",
          teacher_id: teacherId,
          name,
          center,
          gender,
          contact,
        },
      });

      if (created.error || !created.data?.user) {
        const errMsg = created.error?.message || "CREATE_USER_FAILED";
        if (isDuplicateKeyError(created.error)) {
          return json(req, { error: "DUPLICATE_EMAIL" }, { status: 409 });
        }
        return json(req, { error: errMsg }, { status: 400 });
      }

      const authUser = created.data.user;
      let teacherRow = await getTeacherByAuthUserId(admin, authUser.id);
      if (!teacherRow) {
        const { error: insertError } = await admin.from("teachers").insert([{
          auth_user_id: authUser.id,
          teacher_id: teacherId,
          name,
          center,
          gender,
          contact,
          email,
          status: isAdminProvision ? String(payload.status || "normal") : "normal",
          role: "teacher",
          age: 0,
          max_client_limit: 40,
        }]);
        if (insertError) {
          teacherRow = await getTeacherByAuthUserId(admin, authUser.id);
          if (!teacherRow) {
            const { data: fallbackTeacher, error: fallbackTeacherError } = await admin
              .from("teachers")
              .select("id,auth_user_id,teacher_id,email,status,role,name,contact,center")
              .ilike("teacher_id", teacherId)
              .limit(1)
              .maybeSingle();
            if (fallbackTeacherError) throw fallbackTeacherError;
            teacherRow = fallbackTeacher || null;
          }
          if (!teacherRow) throw insertError;
        } else {
          teacherRow = await getTeacherByAuthUserId(admin, authUser.id);
        }
        if (!teacherRow) {
          teacherRow = await getTeacherByAuthUserId(admin, authUser.id);
        }
      }

      if (teacherRow?.id) {
        const { error: updateError } = await admin
          .from("teachers")
          .update({
            auth_user_id: authUser.id,
            teacher_id: teacherId,
            name,
            center,
            gender,
            contact,
            email,
            status: isAdminProvision ? String(payload.status || "normal") : "normal",
          })
          .eq("id", teacherRow.id);
        if (updateError) throw updateError;
      }

      if (!skipAgreement) {
        await saveTermsAgreement(admin, req, {
          teacherId,
          email,
          consentSource,
          consentScope,
          agreedAt: new Date().toISOString(),
          meta: {
            name,
            center,
            created_by: isAdminProvision ? "admin" : "self",
          },
          locale,
          uiVersion,
        });
      }

      return json(req, {
        ok: true,
        teacherId,
        email,
        userId: authUser.id,
      });
    }

    if (action === "sign_in_teacher") {
      const teacherId = normalizeTeacherId(payload.teacherId);
      const password = String(payload.password || "");
      if (!teacherId || !password) {
        return json(req, { error: "INVALID_CREDENTIALS" }, { status: 401 });
      }

      const teacher = await getTeacherById(admin, teacherId);
      if (!teacher?.email) {
        return json(req, { error: "INVALID_CREDENTIALS" }, { status: 401 });
      }
      if (isBlockedTeacher(teacher.status, teacher.withdrawn_at)) {
        return json(req, { error: "ACCOUNT_BLOCKED", status: teacher.status }, { status: 403 });
      }

      const supabaseUrl = getRequiredEnv("SUPABASE_URL");
      const anonKey = getRequiredEnv("SUPABASE_ANON_KEY");
      const tokenController = new AbortController();
      const tokenTimeout = setTimeout(() => tokenController.abort(), 15_000);
      let tokenResponse: Response;
      try {
        tokenResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
          },
          body: JSON.stringify({
            email: teacher.email,
            password,
          }),
          signal: tokenController.signal,
        });
      } catch (_) {
        return json(req, { error: "AUTH_TIMEOUT" }, { status: 504 });
      } finally {
        clearTimeout(tokenTimeout);
      }

      const tokenPayload = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenPayload?.access_token || !tokenPayload?.refresh_token) {
        return json(req, { error: "INVALID_CREDENTIALS" }, { status: 401 });
      }

      return json(req, {
        ok: true,
        session: tokenPayload,
      });
    }

    if (action === "save_terms_agreement") {
      if (!authHeader.startsWith("Bearer ")) {
        throw new Error("AUTH_REQUIRED");
      }
      const authed = createAuthedClient(authHeader);
      const { data: userResult, error: userError } = await authed.auth.getUser();
      if (userError || !userResult?.user) throw new Error("AUTH_REQUIRED");
      const { data: sessionActive, error: sessionError } = await authed.rpc("security_session_active");
      if (sessionError || sessionActive !== true) throw new Error("AUTH_REQUIRED");
      const user = userResult.user;

      const teacher = await getTeacherByAuthUserId(admin, user.id);
      if (!teacher) throw new Error("PROFILE_NOT_FOUND");
      if (isBlockedTeacher(teacher.status, teacher.withdrawn_at)) throw new Error("ACCOUNT_BLOCKED");
      const teacherId = normalizeTeacherId(teacher.teacher_id);
      const email = normalizeEmail(user.email || teacher.email);
      if (!teacherId || !email) throw new Error("PROFILE_NOT_FOUND");
      if ((payload.teacherId && normalizeTeacherId(payload.teacherId) !== teacherId)
        || (payload.email && normalizeEmail(payload.email) !== email)) {
        throw new Error("OWNER_MISMATCH");
      }

      await saveTermsAgreement(admin, req, {
        teacherId,
        email,
        consentSource: String(payload.consentSource || "manual").trim() || "manual",
        consentScope: payload.consentScope && typeof payload.consentScope === "object"
          ? payload.consentScope as Record<string, unknown>
          : {},
        googleScopes: Array.isArray(payload.googleScopes) ? payload.googleScopes.map((value) => String(value || "")) : [],
        agreedAt: new Date().toISOString(),
        meta: payload.meta && typeof payload.meta === "object" ? payload.meta as Record<string, unknown> : {},
        locale: String(payload.locale || "ko-KR").trim() || "ko-KR",
        uiVersion: String(payload.uiVersion || "2026.03").trim() || "2026.03",
        minorOrGuardianAcknowledgedAt: String(payload.minorOrGuardianAcknowledgedAt || "").trim() || null,
      });

      return json(req, { ok: true });
    }

    if (action === "update_password") {
      await ensureAdmin(authHeader);
      const teacherId = normalizeTeacherId(payload.teacherId);
      const newPassword = String(payload.newPassword || "");
      if (!teacherId || !isValidTeacherPassword(newPassword)) {
        return json(req, { error: "INVALID_PASSWORD" }, { status: 400 });
      }

      const teacher = await getTeacherById(admin, teacherId);
      if (!teacher?.auth_user_id) {
        return json(req, { error: "AUTH_USER_NOT_FOUND" }, { status: 404 });
      }

      const updated = await admin.auth.admin.updateUserById(teacher.auth_user_id, {
        password: newPassword,
      });
      if (updated.error) {
        return json(req, { error: "UPDATE_PASSWORD_FAILED" }, { status: 400 });
      }

      return json(req, { ok: true });
    }

    if (action === "withdraw_account") {
      if (!authHeader.startsWith("Bearer ")) {
        return json(req, { error: "AUTH_REQUIRED" }, { status: 401 });
      }

      const authed = createAuthedClient(authHeader);
      const { data: userResult, error: userError } = await authed.auth.getUser();
      if (userError || !userResult?.user) {
        return json(req, { error: "AUTH_REQUIRED" }, { status: 401 });
      }
      const { data: sessionActive, error: sessionError } = await authed.rpc("security_session_active");
      if (sessionError || sessionActive !== true) {
        return json(req, { error: "AUTH_REQUIRED" }, { status: 401 });
      }

      const rpcResult = await authed.rpc("withdraw_teacher_account", {
        p_confirmation_text: String(payload.confirmationText || "").trim(),
        p_reason: String(payload.reason || "").trim(),
        p_confirm_delete: Boolean(payload.confirmDelete),
        p_confirm_retention: Boolean(payload.confirmRetention),
        p_confirm_irreversible: Boolean(payload.confirmIrreversible),
        p_confirm_force_cleanup: Boolean(payload.confirmForceCleanup),
      });

      if (rpcResult.error) {
        return json(req, { error: "WITHDRAW_FAILED" }, { status: 400 });
      }

      const resultPayload = Array.isArray(rpcResult.data) ? rpcResult.data[0] : rpcResult.data;
      if (resultPayload?.ok === false) {
        return json(req, resultPayload, { status: 400 });
      }

      const deleteResult = await admin.auth.admin.deleteUser(userResult.user.id);
      return json(req, {
        ok: true,
        data: {
          ...(resultPayload || {}),
          auth_deleted: !deleteResult.error,
          auth_delete_warning: deleteResult.error?.message || null,
        },
      });
    }

    if (action === "delete_user") {
      await ensureAdmin(authHeader);

      const teacherId = normalizeTeacherId(payload.teacherId);
      if (!teacherId) {
        return json(req, { error: "TEACHER_ID_REQUIRED" }, { status: 400 });
      }

      const teacher = await getTeacherById(admin, teacherId);
      if (!teacher) {
        return json(req, { error: "TEACHER_NOT_FOUND" }, { status: 404 });
      }

      // Delete Auth user first (if linked)
      let authDeleted = false;
      if (teacher.auth_user_id) {
        const deleteResult = await admin.auth.admin.deleteUser(teacher.auth_user_id);
        authDeleted = !deleteResult.error;
        if (deleteResult.error) {
          console.error("[teacher-auth-manager] auth delete warning:", deleteResult.error.message);
        }
      }

      // Delete teacher DB record
      const { error: dbDeleteError } = await admin
        .from("teachers")
        .delete()
        .eq("id", teacher.id);
      if (dbDeleteError) {
        return json(req, { error: dbDeleteError.message || "DELETE_FAILED" }, { status: 500 });
      }

      return json(req, {
        ok: true,
        deletedTeacherId: teacherId,
        authDeleted,
      });
    }

    return json(req, { error: "UNSUPPORTED_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[teacher-auth-manager] failed:", error);
    const knownErrors = new Set(["AUTH_REQUIRED", "ADMIN_ONLY", "MFA_REQUIRED", "ACCOUNT_BLOCKED", "OWNER_MISMATCH", "SUPABASE_CONFIG_MISSING", "TERMS_DOCS_MISSING", "PROFILE_NOT_FOUND"]);
    const msg = error instanceof Error ? error.message : "";
    return json(req, {
      error: knownErrors.has(msg) ? msg : "INTERNAL_ERROR",
    }, { status: msg === "AUTH_REQUIRED" ? 401
      : ["ADMIN_ONLY", "MFA_REQUIRED", "ACCOUNT_BLOCKED", "OWNER_MISMATCH"].includes(msg) ? 403
      : knownErrors.has(msg) ? 400 : 500 });
  }
});
