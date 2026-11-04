import { createClient } from "npm:@supabase/supabase-js@2";
const ALLOWED_ORIGINS = new Set([
  "https://thehahalab.com",
  "https://www.thehahalab.com",
  "https://hahalab.pages.dev",
  "http://localhost:4173",
  "http://127.0.0.1:4173"
]);
const buildCorsHeaders = (req)=>{
  const origin = req.headers.get("Origin") || "";
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://thehahalab.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };
};
const json = (req, body, init = {})=>new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...buildCorsHeaders(req),
      ...init.headers || {}
    }
  });
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
const sanitizeTtsText = (value)=>String(value || "").replace(/[<>{}[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
Deno.serve(async (req)=>{
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  if (req.method !== "POST") {
    return json(req, {
      error: "METHOD_NOT_ALLOWED"
    }, {
      status: 405
    });
  }
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(req, {
      error: "AUTH_REQUIRED"
    }, {
      status: 401
    });
  }
  let payload;
  try {
    payload = await req.json();
  } catch  {
    return json(req, {
      error: "INVALID_JSON"
    }, {
      status: 400
    });
  }
  try {
    const supabase = getSupabaseAuthedClient(authHeader);
    const { data: userResult, error: userError } = await supabase.auth.getUser();
    if (userError || !userResult?.user) {
      return json(req, {
        error: "INVALID_SESSION"
      }, {
        status: 401
      });
    }
    const gate = await supabase.rpc("security_learning_write_allowed");
    if (gate.error || gate.data !== true) return json(req, { error: "TTS_FORBIDDEN" }, { status: 403 });
    const apiKey = Deno.env.get("GOOGLE_TTS_API_KEY");
    if (!apiKey) {
      return json(req, {
        error: "GOOGLE_TTS_CONFIG_MISSING"
      }, {
        status: 503
      });
    }
    const text = sanitizeTtsText(payload.text);
    if (!text) {
      return json(req, {
        error: "TEXT_REQUIRED"
      }, {
        status: 400
      });
    }
    const requestedRate = Number(payload.speakingRate ?? 0.86);
    if (!Number.isFinite(requestedRate)) return json(req, { error: "INVALID_SPEAKING_RATE" }, { status: 400 });
    const speakingRate = Math.round(Math.min(Math.max(requestedRate, 0.6), 1.05) * 100) / 100;
    // The database atomically claims identical requests and reserves account +
    // global budgets before any provider request. A missing quota RPC fails closed.
    const reservation = await supabase.rpc("security_reserve_tts_request", { p_text: text, p_speaking_rate: speakingRate });
    if (reservation.error || !reservation.data) return json(req, { error: "TTS_QUOTA_UNAVAILABLE" }, { status: 503 });
    if (reservation.data.status === "cached" && typeof reservation.data.audioContent === "string") return json(req, { audioContent: reservation.data.audioContent, provider: "google-tts", languageCode: "ko-KR" });
    if (reservation.data.status === "pending") return json(req, { error: "TTS_REQUEST_PENDING" }, { status: 409, headers: { "Retry-After": "2" } });
    if (reservation.data.status === "quota-exceeded") return json(req, { error: "TTS_QUOTA_EXCEEDED" }, { status: 429 });
    if (reservation.data.status !== "reserved" || !/^[0-9a-f-]{36}$/i.test(String(reservation.data.requestId || ""))) return json(req, { error: "TTS_QUOTA_UNAVAILABLE" }, { status: 503 });
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!serviceKey) return json(req, { error: "TTS_QUOTA_UNAVAILABLE" }, { status: 503 });
    const service = createClient(Deno.env.get("SUPABASE_URL"), serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const complete = async (audioContent, outcome)=>{
      const result = await service.rpc("security_complete_tts_request", { p_request_id: reservation.data.requestId, p_audio_content: audioContent, p_outcome: outcome });
      return !result.error && result.data === true;
    };
    const voicePayloads = [
      {
        input: {
          text
        },
        voice: {
          languageCode: "ko-KR",
          name: "ko-KR-Neural2-A"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate,
          pitch: 0,
          volumeGainDb: 0
        }
      },
      {
        input: {
          text
        },
        voice: {
          languageCode: "ko-KR",
          name: "ko-KR-Wavenet-A"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate,
          pitch: 0,
          volumeGainDb: 0
        }
      },
      {
        input: {
          text
        },
        voice: {
          languageCode: "ko-KR",
          ssmlGender: "FEMALE"
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate,
          pitch: 0,
          volumeGainDb: 0
        }
      }
    ];
    let lastError = "GOOGLE_TTS_UNAVAILABLE";
    for (const voicePayload of voicePayloads){
      let response;
      try {
        response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
          body: JSON.stringify(voicePayload),
          signal: AbortSignal.timeout(15_000)
        });
      } catch {
        lastError = "GOOGLE_TTS_UNAVAILABLE";
        continue;
      }
      if (!response.ok) {
        lastError = `GOOGLE_TTS_HTTP_${response.status}`;
        continue;
      }
      const data = await response.json();
      if (typeof data?.audioContent === "string" && data.audioContent.length <= 524288 && /^[A-Za-z0-9+/]+={0,2}$/.test(data.audioContent)) {
        if (!await complete(data.audioContent, "ready")) return json(req, { error: "TTS_CACHE_UNAVAILABLE" }, { status: 503 });
        return json(req, {
          audioContent: data.audioContent,
          provider: "google-tts",
          languageCode: "ko-KR"
        });
      }
      lastError = "GOOGLE_TTS_EMPTY_AUDIO";
    }
    await complete(null, "failed");
    return json(req, {
      error: lastError
    }, {
      status: 502
    });
  } catch (error) {
    console.error("[cardlab-tts] failed:", error);
    return json(req, {
      error: "UNKNOWN_ERROR"
    }, {
      status: 500
    });
  }
});
