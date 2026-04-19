import fs from "node:fs";
import path from "node:path";

const REQUIRED_KEYS = [
  "commonName",
  "scientificName",
  "heroSubtitle",
  "growthStage",
  "healthStatus",
  "healthTrend",
  "waterHabit",
  "sunlightHabit",
  "waterAdvice",
  "sunlightAdvice",
  "soilMoisture",
  "videoTitle",
  "videoMeta",
];

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function resolveImagePath(rootDir, cliPath) {
  if (cliPath) {
    return path.isAbsolute(cliPath) ? cliPath : path.join(rootDir, cliPath);
  }

  const sampleDir = path.join(
    rootDir,
    "experiments",
    "hunyuan-3d",
    "samples",
    "source-images",
  );
  const imageName = fs
    .readdirSync(sampleDir)
    .find((name) => /\.(jpg|jpeg|png|webp)$/i.test(name));

  if (!imageName) {
    throw new Error("No sample image found. Pass one explicitly: npm run debug:recognize -- <image-path>");
  }

  return path.join(sampleDir, imageName);
}

function toDataUrl(imagePath) {
  const bytes = fs.readFileSync(imagePath);
  const extension = path.extname(imagePath).toLowerCase();
  const mime =
    extension === ".png"
      ? "image/png"
      : extension === ".webp"
        ? "image/webp"
        : "image/jpeg";

  return `data:${mime};base64,${bytes.toString("base64")}`;
}

function extractTextContent(payload) {
  const message = payload?.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n");
  }

  return null;
}

function safeParseJson(text) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function validateRecognizePayload(value) {
  if (!value || typeof value !== "object") {
    return {
      ok: false,
      missingKeys: [...REQUIRED_KEYS],
      invalidKeys: REQUIRED_KEYS,
    };
  }

  const record = value;
  const missingKeys = REQUIRED_KEYS.filter((key) => !(key in record));
  const invalidKeys = [];

  for (const key of REQUIRED_KEYS) {
    if (!(key in record)) {
      continue;
    }

    const current = record[key];
    if (key === "soilMoisture") {
      if (typeof current !== "number" || Number.isNaN(current)) {
        invalidKeys.push(key);
      }
      continue;
    }

    if (key === "healthTrend") {
      if (!["up", "down", "steady"].includes(current)) {
        invalidKeys.push(key);
      }
      continue;
    }

    if (typeof current !== "string" || current.trim().length === 0) {
      invalidKeys.push(key);
    }
  }

  return {
    ok: missingKeys.length === 0 && invalidKeys.length === 0,
    missingKeys,
    invalidKeys,
  };
}

async function main() {
  const webDir = process.cwd();
  const rootDir = path.resolve(webDir, "..");
  const env = {
    ...loadEnvFile(path.join(rootDir, ".env")),
    ...process.env,
  };

  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  const model = process.argv[3] || env.OPENROUTER_VISION_MODEL || "moonshotai/kimi-k2.5";
  const apiUrl =
    env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";
  const imagePath = resolveImagePath(rootDir, process.argv[2]);
  const dataUrl = toDataUrl(imagePath);

  const systemPrompt = `你是植物识别 + 养护专家。看图后只返回严格 JSON（无 markdown / 注释 / 说明），字段如下：
{
  "commonName": string,
  "scientificName": string,
  "heroSubtitle": string,
  "growthStage": string,
  "healthStatus": string,
  "healthTrend": "up" | "down" | "steady",
  "waterHabit": string,
  "sunlightHabit": string,
  "waterAdvice": string,
  "sunlightAdvice": string,
  "soilMoisture": number,
  "videoTitle": string,
  "videoMeta": string
}
若无法判定字段则给出最合理的常识值，但绝不能省略字段。`;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: "请识别这张图中的植物并按要求输出 JSON。" },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  const rawText = await response.text();
  let parsedResponse = null;

  try {
    parsedResponse = JSON.parse(rawText);
  } catch {
    parsedResponse = null;
  }

  const extractedText = parsedResponse ? extractTextContent(parsedResponse) : null;
  const parsedJson = extractedText ? safeParseJson(extractedText) : null;
  const validation = parsedJson
    ? validateRecognizePayload(parsedJson)
    : { ok: false, missingKeys: REQUIRED_KEYS, invalidKeys: [] };

  console.log(`Image: ${imagePath}`);
  console.log(`Model: ${model}`);
  console.log(`HTTP: ${response.status} ${response.ok ? "OK" : "FAILED"}`);

  if (!response.ok) {
    console.log("\nRaw response:");
    console.log(rawText.slice(0, 4000));
    process.exitCode = 1;
    return;
  }

  console.log(`Raw JSON response parsed: ${parsedResponse ? "yes" : "no"}`);
  console.log(`Assistant content extracted: ${extractedText ? "yes" : "no"}`);
  console.log(`Recognize JSON parsed: ${parsedJson ? "yes" : "no"}`);
  console.log(`Schema validation: ${validation.ok ? "pass" : "fail"}`);

  if (!validation.ok) {
    console.log("\nMissing keys:", validation.missingKeys.join(", ") || "(none)");
    console.log("Invalid keys:", validation.invalidKeys.join(", ") || "(none)");
    console.log("\nExtracted content:");
    console.log((extractedText || rawText).slice(0, 4000));
    process.exitCode = 1;
    return;
  }

  console.log("\nParsed payload:");
  console.log(JSON.stringify(parsedJson, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
