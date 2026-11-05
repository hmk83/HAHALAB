import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import { GetObjectCommand, PutObjectCommand, S3Client } from "npm:@aws-sdk/client-s3@3.1161.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.1161.0";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store"
};
const json = (body, init = {})=>new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...init.headers || {}
    }
  });
const sanitizeFileName = (value)=>String(value || "file").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._가-힣-]/g, "").slice(0, 120) || `file-${Date.now()}`;
const sanitizeKey = (value)=>String(value || "").split("/").map((segment)=>segment.trim()).filter(Boolean).map((segment)=>segment.replace(/[^a-zA-Z0-9._가-힣-]/g, "-")).join("/");
const worksheetKey = (value)=>{
  if (typeof value !== "string" || value !== value.trim() || value.length > 1024 ||
      !value.startsWith("worksheets/originals/") || /[\u0000-\u001f\u007f\\?#%]/.test(value) ||
      value.split("/").some((part)=>!part || part === "." || part === "..")) throw new Error("INVALID_WORKSHEET_KEY");
  return value;
};
const requireGate = async (client, name)=>{
  const { data, error } = await client.rpc(name);
  if (error || data !== true) throw new Error(name === "security_admin_active" ? "ADMIN_REQUIRED" : "INVALID_SESSION");
};
const authorizeWorksheetKey = async (client, key)=>{
  // This is a shared worksheet catalogue. The caller's RLS visibility, rather
  // than an invented per-teacher ownership column, authorizes the resource.
  for (const field of ["key", "storageKey"]) {
    const { data, error } = await client.from("worksheets").select("assets").contains("assets", [{ [field]: key }]).limit(1);
    if (error) throw new Error("RESOURCE_LOOKUP_FAILED");
    if ((data || []).some((row)=>Array.isArray(row.assets) && row.assets.some((asset)=>
      asset && typeof asset === "object" && String(asset.key || asset.storageKey || "") === key &&
      (!asset.storageProvider || asset.storageProvider === "r2")))) return;
  }
  throw new Error("RESOURCE_FORBIDDEN");
};
const buildR2Client = ()=>{
  const endpoint = Deno.env.get("R2_ENDPOINT");
  const accessKeyId = Deno.env.get("R2_ACCESS_KEY_ID");
  const secretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY");
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("R2_CONFIG_MISSING");
  }
  return new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle: false,
    requestChecksumCalculation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
};
const getSupabaseAuthedClient = (authHeader)=>{
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("SUPABASE_CONFIG_MISSING");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader
      }
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};
Deno.serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return json({
      error: "METHOD_NOT_ALLOWED"
    }, {
      status: 405
    });
  }
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({
      error: "AUTH_REQUIRED"
    }, {
      status: 401
    });
  }
  let payload;
  try {
    payload = await req.json();
  } catch  {
    return json({
      error: "INVALID_JSON"
    }, {
      status: 400
    });
  }
  const action = String(payload.action || "");
  if (!action) {
    return json({
      error: "ACTION_REQUIRED"
    }, {
      status: 400
    });
  }
  try {
    const supabase = getSupabaseAuthedClient(authHeader);
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult?.user) {
      return json({
        error: "INVALID_SESSION"
      }, {
        status: 401
      });
    }
    await requireGate(supabase, "security_session_active");
    const bucket = Deno.env.get("R2_BUCKET");
    if (!bucket) {
      throw new Error("R2_BUCKET_MISSING");
    }
    const r2 = buildR2Client();
    if (action === "createUploadUrl") {
      await requireGate(supabase, "security_admin_active");
      const contentType = String(payload.contentType || "application/octet-stream").trim() || "application/octet-stream";
      if (!["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"].includes(contentType)) throw new Error("INVALID_CONTENT_TYPE");
      const sizeBytes = Number(payload.sizeBytes);
      if (!Number.isSafeInteger(sizeBytes) || sizeBytes < 1 || sizeBytes > 50 * 1024 * 1024) throw new Error("INVALID_UPLOAD_SIZE");
      const fileName = sanitizeFileName(String(payload.fileName || "worksheet-file"));
      const date = new Date();
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const key = `worksheets/originals/${year}/${month}/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
      const uploadUrl = await getSignedUrl(r2, new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
        ContentLength: sizeBytes
      }), {
        expiresIn: 60 * 15,
        signableHeaders: new Set(["content-length", "content-type"])
      });
      return json({
        key,
        bucket,
        storageProvider: "r2",
        uploadUrl,
        expiresIn: 60 * 15
      });
    }
    if (action === "createDownloadUrls") {
      const rawKeys = Array.isArray(payload.keys) ? payload.keys : [];
      if (rawKeys.length > 50) throw new Error("BATCH_LIMIT_EXCEEDED");
      const keys = [...new Set(rawKeys.map(worksheetKey))];
      if (keys.length === 0) {
        return json({
          error: "KEYS_REQUIRED"
        }, {
          status: 400
        });
      }
      // Resolve every key before issuing any capability. A mixed forbidden
      // batch cannot leak a partial set of signed URLs.
      await Promise.all(keys.map((key)=>authorizeWorksheetKey(supabase, key)));
      const items = await Promise.all(keys.map(async (key)=>{
        const downloadUrl = await getSignedUrl(r2, new GetObjectCommand({
          Bucket: bucket,
          Key: key
        }), {
          expiresIn: 60 * 20
        });
        return {
          key,
          bucket,
          storageProvider: "r2",
          downloadUrl,
          expiresIn: 60 * 20
        };
      }));
      return json({
        items
      });
    }
    return json({
      error: "UNSUPPORTED_ACTION"
    }, {
      status: 400
    });
  } catch (error) {
    console.error("[worksheet-r2-storage] failed:", error);
    const message = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    const status = message === "INVALID_SESSION" ? 401 : ["ADMIN_REQUIRED", "RESOURCE_FORBIDDEN"].includes(message) ? 403 : ["INVALID_WORKSHEET_KEY", "BATCH_LIMIT_EXCEEDED", "INVALID_CONTENT_TYPE", "INVALID_UPLOAD_SIZE"].includes(message) ? 400 : 500;
    return json({ error: status === 500 ? "STORAGE_UNAVAILABLE" : message }, { status });
  }
});
