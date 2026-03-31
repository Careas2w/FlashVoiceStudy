import { createHash, randomBytes } from "node:crypto";
import { WebSocket } from "ws";

const CHROMIUM_FULL_VERSION = "143.0.3650.75";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
const WINDOWS_FILE_TIME_EPOCH = 11644473600n;
const DEFAULT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

const VOICE_ALIASES = {
  alloy: "en-US-AriaNeural",
  ash: "en-US-GuyNeural",
  coral: "en-US-JennyNeural",
  echo: "en-US-AndrewNeural",
  fable: "en-GB-SoniaNeural",
  nova: "en-US-AvaNeural",
  onyx: "en-US-EricNeural",
  sage: "en-US-EmmaNeural",
  shimmer: "en-US-AmberNeural"
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function escapeXml(value) {
  return String(value ?? "").replace(/[<>&"']/g, (char) => {
    switch (char) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case '"': return "&quot;";
      case "'": return "&apos;";
      default: return char;
    }
  });
}

function generateSecMsGecToken() {
  const ticks = BigInt(Math.floor((Date.now() / 1000) + Number(WINDOWS_FILE_TIME_EPOCH))) * 10000000n;
  const roundedTicks = ticks - (ticks % 3000000000n);
  const strToHash = `${roundedTicks}${TRUSTED_CLIENT_TOKEN}`;
  const hash = createHash("sha256");
  hash.update(strToHash, "ascii");
  return hash.digest("hex").toUpperCase();
}

function normalizeVoice(input, lang) {
  const requested = String(input || "").trim();
  if (VOICE_ALIASES[requested]) return VOICE_ALIASES[requested];
  if (requested) return requested;
  return String(lang || "").toLowerCase().startsWith("ko") ? "ko-KR-SunHiNeural" : "es-ES-ElviraNeural";
}

function normalizeLang(voice, fallback = "ko-KR") {
  const parts = String(voice || fallback).split("-");
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : fallback;
}

function normalizeProsodySpeed(value) {
  const num = Number(value ?? 1);
  if (!Number.isFinite(num)) return "default";
  if (num <= 0.7) return "-30%";
  if (num <= 0.85) return "-15%";
  if (num >= 1.25) return "+25%";
  if (num >= 1.1) return "+10%";
  return "default";
}

function normalizeOutputFormat(format) {
  const clean = String(format || "").trim();
  return clean || DEFAULT_FORMAT;
}

function splitText(text, maxLength = 1200) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  if (clean.length <= maxLength) return [clean];

  const parts = [];
  let remaining = clean;
  while (remaining.length > maxLength) {
    let cut = remaining.lastIndexOf(". ", maxLength);
    if (cut < Math.floor(maxLength * 0.6)) cut = remaining.lastIndexOf("! ", maxLength);
    if (cut < Math.floor(maxLength * 0.6)) cut = remaining.lastIndexOf("? ", maxLength);
    if (cut < Math.floor(maxLength * 0.6)) cut = remaining.lastIndexOf(", ", maxLength);
    if (cut < Math.floor(maxLength * 0.6)) cut = remaining.lastIndexOf(" ", maxLength);
    if (cut < 1) cut = maxLength;
    const piece = remaining.slice(0, cut + 1).trim();
    parts.push(piece);
    remaining = remaining.slice(cut + 1).trim();
  }
  if (remaining) parts.push(remaining);
  return parts;
}

async function synthesizeChunk(text, { voice, lang, rate, outputFormat, timeoutMs = 20000 }) {
  const requestId = randomBytes(16).toString("hex");
  const secMsGec = generateSecMsGecToken();

  return await new Promise((resolve, reject) => {
    const socket = new WebSocket(
      `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-${CHROMIUM_FULL_VERSION}`,
      {
        host: "speech.platform.bing.com",
        origin: "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
          "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM_FULL_VERSION.split(".")[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM_FULL_VERSION.split(".")[0]}.0.0.0`,
          "Accept-Encoding": "gzip, deflate, br, zstd",
          "Accept-Language": "en-US,en;q=0.9"
        }
      }
    );

    const audioChunks = [];
    const timer = setTimeout(() => {
      try { socket.close(); } catch {}
      reject(new Error("Edge TTS tardó demasiado en responder."));
    }, timeoutMs);

    socket.on("open", () => {
      socket.send(`Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"${outputFormat}"}}}}`);

      const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${escapeXml(lang)}"><voice name="${escapeXml(voice)}"><prosody rate="${escapeXml(rate)}">${escapeXml(text)}</prosody></voice></speak>`;
      socket.send(`X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n${ssml}`);
    });

    socket.on("message", (data, isBinary) => {
      if (isBinary) {
        const separator = Buffer.from("Path:audio\r\n");
        const index = data.indexOf(separator);
        const audioData = index >= 0 ? data.subarray(index + separator.length) : data;
        if (audioData?.length) audioChunks.push(Buffer.from(audioData));
        return;
      }

      const message = data.toString();
      if (message.includes("Path:turn.end")) {
        clearTimeout(timer);
        try { socket.close(); } catch {}
        resolve(Buffer.concat(audioChunks));
      }
    });

    socket.on("error", (error) => {
      clearTimeout(timer);
      try { socket.close(); } catch {}
      reject(error instanceof Error ? error : new Error(String(error)));
    });

    socket.on("close", () => {});
  });
}

async function synthesizeText(text, options) {
  const chunks = splitText(text);
  if (!chunks.length) throw new Error("No hay texto para sintetizar.");

  const buffers = [];
  for (const chunk of chunks) {
    const buffer = await synthesizeChunk(chunk, options);
    buffers.push(buffer);
  }
  return Buffer.concat(buffers);
}

function requireAuth(request, env) {
  const configured = String(env.API_KEY || "").trim();
  if (!configured) return null;
  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token !== configured) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return json({
        ok: true,
        service: "Korean Flashstudy Edge TTS Worker",
        routes: ["/", "/health", "/voices", "/v1/audio/speech"],
        note: "POST /v1/audio/speech con formato compatible con OpenAI TTS."
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, provider: "edge-tts", timestamp: new Date().toISOString() });
    }

    if (request.method === "GET" && url.pathname === "/voices") {
      return json({
        ok: true,
        voices: [
          "ko-KR-SunHiNeural",
          "ko-KR-InJoonNeural",
          "es-ES-ElviraNeural",
          "es-ES-AlvaroNeural",
          "en-US-AriaNeural",
          "en-US-JennyNeural"
        ]
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/audio/speech") {
      const authError = requireAuth(request, env);
      if (authError) return authError;

      try {
        const body = await request.json();
        const input = String(body.input || body.text || "").trim();
        if (!input) {
          return json({ error: "Falta el texto de entrada." }, 400);
        }

        const voice = normalizeVoice(body.voice, body.lang);
        const lang = normalizeLang(voice, String(body.lang || "ko-KR"));
        const rate = normalizeProsodySpeed(body.speed);
        const outputFormat = normalizeOutputFormat(body.response_format === "mp3" ? DEFAULT_FORMAT : body.output_format);

        const audioBuffer = await synthesizeText(input, {
          voice,
          lang,
          rate,
          outputFormat
        });

        return new Response(audioBuffer, {
          status: 200,
          headers: {
            ...corsHeaders(),
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-store",
            "X-Voice-Used": voice
          }
        });
      } catch (error) {
        return json({
          error: "No se pudo generar el audio.",
          detail: error?.message || String(error)
        }, 500);
      }
    }

    return json({ error: "Ruta no encontrada." }, 404);
  }
};
