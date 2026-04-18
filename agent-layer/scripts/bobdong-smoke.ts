/**
 * Smoke test for bobdong.cn gateways:
 * - openai: POST /v1/chat/completions (OpenAI-compatible, Bearer auth)
 * - gemini: POST /v1beta/models/...:generateContent (x-goog-api-key)
 *
 * Loads keys from agent-layer/.env (same vars as PLANT_AGENT_OPENAI_COMPATIBLE_*).
 * Do not hardcode secrets in this file.
 */
import "dotenv/config";

// Minimal valid 1x1 JPEG (white pixel) — gateways reject truncated/invalid base64.
const TINY_JPEG_B64 =
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAG/AP/Z";

function apiKey(): string {
  const k =
    process.env.PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY?.trim() ||
    process.env.BOBDONG_API_KEY?.trim();
  if (!k) {
    throw new Error(
      "Set PLANT_AGENT_OPENAI_COMPATIBLE_API_KEY or BOBDONG_API_KEY in .env",
    );
  }
  return k;
}

function openAiChatUrl(): string {
  return (
    process.env.BOBDONG_OPENAI_CHAT_URL?.trim() ||
    "https://bobdong.cn/v1/chat/completions"
  );
}

function geminiGenerateUrl(): string {
  return (
    process.env.BOBDONG_GEMINI_GENERATE_URL?.trim() ||
    "https://bobdong.cn/v1beta/models/gemini-3-pro-image-preview:generateContent"
  );
}

const sharedPrompt =
  "Reply with a single word OK if you can read this multimodal request. " +
  "If generating an image, describe briefly what you would output.";

async function smokeOpenAiCompatible(): Promise<void> {
  const url = openAiChatUrl();
  const body = {
    model: "gemini-3-pro-image-preview",
    extra_body: {
      imageConfig: {
        aspectRatio: "9:16",
        imageSize: "2K",
      },
    },
    messages: [
      {
        role: "system",
        content: JSON.stringify({
          imageConfig: { aspectRatio: "9:16", imageSize: "2K" },
        }),
      },
      {
        role: "user",
        content: [
          { type: "text", text: sharedPrompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${TINY_JPEG_B64}` },
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${TINY_JPEG_B64}` },
          },
        ],
      },
    ],
    max_tokens: 512,
    temperature: 0.8,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      Accept: "*/*",
      "User-Agent": "guyu-agent-layer/bobdong-smoke",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`[openai-compatible] HTTP ${res.status} ${res.statusText}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text.slice(0, 4000));
  }
  if (!res.ok) process.exitCode = 1;
}

async function smokeGeminiNative(): Promise<void> {
  const url = geminiGenerateUrl();
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: sharedPrompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: TINY_JPEG_B64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 512,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey(),
      "Content-Type": "application/json",
      Accept: "*/*",
      "User-Agent": "guyu-agent-layer/bobdong-smoke",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  console.log(`[gemini-native] HTTP ${res.status} ${res.statusText}`);
  try {
    console.log(JSON.stringify(JSON.parse(text), null, 2));
  } catch {
    console.log(text.slice(0, 4000));
  }
  if (!res.ok) process.exitCode = 1;
}

const mode = (process.argv[2] ?? "openai").toLowerCase();
if (mode === "openai" || mode === "chat") {
  await smokeOpenAiCompatible();
} else if (mode === "gemini" || mode === "native") {
  await smokeGeminiNative();
} else {
  console.error(
    "Usage: tsx scripts/bobdong-smoke.ts [openai|gemini]\n" +
      "  openai  — POST .../v1/chat/completions (Bearer)\n" +
      "  gemini  — POST .../v1beta/models/...:generateContent (x-goog-api-key)",
  );
  process.exit(2);
}
