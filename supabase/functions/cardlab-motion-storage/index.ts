import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectsCommand } from "npm:@aws-sdk/client-s3@3.1161.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.1161.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};
const json = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const env = (name: string) => Deno.env.get(name) || "";
const bucket = env("R2_BUCKET");
const endpoint = env("R2_ENDPOINT");
const accessKeyId = env("R2_ACCESS_KEY_ID");
const secretAccessKey = env("R2_SECRET_ACCESS_KEY");
const supabaseUrl = env("SUPABASE_URL");
const supabaseAnonKey = env("SUPABASE_ANON_KEY");
const s3 = new S3Client({ region: "auto", endpoint, forcePathStyle: true, requestChecksumCalculation: "WHEN_REQUIRED", credentials: { accessKeyId, secretAccessKey } });
function assertR2Config() { if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) throw new Error("R2_CONFIG_MISSING"); }
function sanitizeFileName(value: string) {
  const safe = String(value || "file").normalize("NFKD").replace(/[^\x20-\x7E]/g, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").replace(/^\.+/, "").replace(/^[-_]+|[-_]+$/g, "");
  return safe || "file-" + Date.now();
}
function normalizeMotionKey(value: string) {
  const key = String(value || "");
  if (!key || key !== key.trim() || key.length > 1024 || /[\u0000-\u001f\u007f\\?#%]/.test(key) ||
      key.split("/").some((part)=>!part || part === "." || part === "..") || !key.startsWith("cardlab/motion-cards/")) throw new Error("INVALID_MOTION_CARD_KEY");
  return key;
}
function inferExtension(fileName: string, contentType = "") {
  const lowerType = String(contentType || "").toLowerCase();
  const parts = String(fileName || "").split("?")[0].split("#")[0].split(".");
  const rawExtension = parts.length > 1 ? String(parts.pop() || "").toLowerCase() : "";
  if (rawExtension) return rawExtension;
  if (lowerType.includes("webp")) return "webp";
  if (lowerType.includes("png")) return "png";
  if (lowerType.includes("jpeg") || lowerType.includes("jpg")) return "jpg";
  if (lowerType.includes("gif")) return "gif";
  if (lowerType.includes("mp4")) return "mp4";
  if (lowerType.includes("webm")) return "webm";
  if (lowerType.includes("quicktime")) return "mov";
  if (lowerType === "video/x-m4v") return "m4v";
  if (lowerType === "video/ogg") return "ogv";
  return "bin";
}
async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const accessToken = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  if (!accessToken) throw new Error("AUTH_REQUIRED");
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("SUPABASE_CONFIG_MISSING");
  const client = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: "Bearer " + accessToken } }, auth: { persistSession: false } });
  const { data: userResult, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userResult?.user) throw new Error("AUTH_REQUIRED");
  const { data: active, error: sessionError } = await client.rpc("security_session_active");
  if (sessionError || active !== true) throw new Error("AUTH_REQUIRED");
  const { data: isAdmin, error: adminError } = await client.rpc("security_admin_active");
  if (adminError) throw adminError;
  if (isAdmin !== true) throw new Error("ADMIN_REQUIRED");
  return client;
}
async function createDownloadUrls(req: Request, payload: Record<string, unknown>) {
  assertR2Config();
  const rawKeys = Array.isArray(payload.keys) ? payload.keys : [];
  if (!rawKeys.length || rawKeys.length > 50) throw new Error("INVALID_BATCH_SIZE");
  const keys = Array.from(new Set(rawKeys.map((value) => normalizeMotionKey(String(value || "")))));
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("SUPABASE_CONFIG_MISSING");
  const auth = req.headers.get("Authorization") || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";
  // The catalogue intentionally permits anonymous reads. The normal browser
  // may send its public anon key as Authorization; this is not a user session.
  const isUserRequest = Boolean(token && token !== supabaseAnonKey);
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    ...(isUserRequest ? { global: { headers: { Authorization: "Bearer " + token } } } : {}),
    auth: { persistSession: false, autoRefreshToken: false }
  });
  if (isUserRequest) {
    const { data: user, error } = await client.auth.getUser(token);
    const session = await client.rpc("security_session_active");
    if (error || !user?.user || session.error || session.data !== true) throw new Error("AUTH_REQUIRED");
  }
  const allowed = new Set<string>();
  let unpublished = false;
  for (const field of ["motion_key", "thumbnail_key"]) {
    const { data, error } = await client.from("cardlab_motion_assets").select("motion_key,thumbnail_key,storage_provider,is_active").in(field, keys);
    if (error) throw new Error("RESOURCE_LOOKUP_FAILED");
    for (const asset of data || []) {
      if (asset.storage_provider !== "r2") continue;
      if (asset.is_active === false) unpublished = true;
      for (const key of [asset.motion_key, asset.thumbnail_key]) if (keys.includes(key)) allowed.add(key);
    }
  }
  if (unpublished) await requireAdmin(req);
  if (keys.some((key)=>!allowed.has(key))) throw new Error("RESOURCE_FORBIDDEN");
  const expiresIn = Math.max(60, Math.min(3600, Number(payload.expiresIn || 1200) || 1200));
  const items = [];
  for (const key of keys) {
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
    items.push({ key, url, downloadUrl: url, expiresIn });
  }
  return { items };
}
async function createUploadUrl(req: Request, payload: Record<string, unknown>) {
  await requireAdmin(req);
  assertR2Config();
  const kind = String(payload.kind || payload.variant || "motion").toLowerCase() === "thumbnail" ? "thumbnail" : "motion";
  const fileName = sanitizeFileName(String(payload.fileName || "motion-card"));
  const contentType = String(payload.contentType || "application/octet-stream");
  if (!["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime", "video/x-m4v", "video/ogg"].includes(contentType)) throw new Error("INVALID_CONTENT_TYPE");
  const sizeBytes = Number(payload.sizeBytes);
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > (kind === "thumbnail" ? 10 : 100) * 1024 * 1024) throw new Error("INVALID_UPLOAD_SIZE");
  const date = new Date();
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const extension = inferExtension(fileName, contentType);
  const stem = fileName.replace(/\.[^.]+$/, "") || "motion-card";
  const key = "cardlab/motion-cards/" + (kind === "thumbnail" ? "thumbnails" : "motions") + "/" + year + "/" + month + "/" + Date.now().toString(36) + "-" + sanitizeFileName(stem) + "." + extension;
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ContentLength: sizeBytes }), { expiresIn: 900, signableHeaders: new Set(["content-length", "content-type"]) });
  return { key, uploadUrl, storageProvider: "r2", expiresIn: 900 };
}
async function deleteObjects(req: Request, payload: Record<string, unknown>) {
  await requireAdmin(req);
  assertR2Config();
  const rawKeys = Array.isArray(payload.keys) ? payload.keys : [];
  if (rawKeys.length > 50) throw new Error("INVALID_BATCH_SIZE");
  const keys = Array.from(new Set(rawKeys.map((value) => normalizeMotionKey(String(value || "")))));
  if (!keys.length) return { deleted: 0 };
  await s3.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }));
  return { deleted: keys.length };
}
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || "").trim();
    if (action === "createDownloadUrls") return json(await createDownloadUrls(req, payload));
    if (action === "createUploadUrl") return json(await createUploadUrl(req, payload));
    if (action === "deleteObjects") return json(await deleteObjects(req, payload));
    return json({ error: "UNKNOWN_ACTION" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "AUTH_REQUIRED" ? 401 : ["ADMIN_REQUIRED", "RESOURCE_FORBIDDEN"].includes(message) ? 403 : message === "RESOURCE_LOOKUP_FAILED" ? 503 : 400;
    return json({ error: message }, status);
  }
});
