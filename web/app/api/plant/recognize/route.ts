import { NextResponse } from "next/server";

const PIXEL_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL ?? "black-forest-labs/flux.2-pro";
const VISION_MODEL =
  process.env.OPENROUTER_VISION_MODEL ?? "google/gemini-2.5-flash";
const OPENROUTER_URL =
  process.env.OPENROUTER_BASE_URL ??
  "https://openrouter.ai/api/v1/chat/completions";

type OpenRouterContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      images?: Array<{
        type?: string;
        image_url?: { url?: string };
      }>;
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
            image_url?: { url?: string };
          }>;
    };
  }>;
};

type RecognizedPlant = {
  commonName: string;
  scientificName: string;
  heroSubtitle: string;
  growthStage: string;
  healthStatus: string;
  healthTrend: "up" | "down" | "steady";
  waterHabit: string;
  sunlightHabit: string;
  waterAdvice: string;
  sunlightAdvice: string;
  soilMoisture: number;
  videoTitle: string;
  videoMeta: string;
  videoUrl?: string;
};

const FALLBACK_PROFILE: RecognizedPlant = {
  commonName: "未知植物",
  scientificName: "Unknown species",
  heroSubtitle: "等待 AI 识别更多线索",
  growthStage: "稳定",
  healthStatus: "状态良好",
  healthTrend: "steady",
  waterHabit: "适中",
  sunlightHabit: "明亮散射",
  waterAdvice: "3 天后浇",
  sunlightAdvice: "避免暴晒",
  soilMoisture: 55,
  videoTitle: "通用养护入门",
  videoMeta: "5 min · 新手友好",
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY in web env." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const sourceImage = formData.get("image");

  if (!(sourceImage instanceof File) || sourceImage.size === 0) {
    return NextResponse.json({ error: "缺少植物图片" }, { status: 400 });
  }

  const dataUrl = await fileToDataUrl(sourceImage);

  const [recognition, pixelArtUrl] = await Promise.allSettled([
    recognizePlant({ apiKey, dataUrl }),
    generatePixelArt({ apiKey, dataUrl }),
  ]);

  const profile =
    recognition.status === "fulfilled" ? recognition.value : FALLBACK_PROFILE;
  const pixelImageUrl =
    pixelArtUrl.status === "fulfilled" ? pixelArtUrl.value : null;

  return NextResponse.json({
    ok: true,
    profile,
    pixelImageUrl,
    originalImageUrl: dataUrl,
    recognitionError:
      recognition.status === "rejected"
        ? String((recognition.reason as Error)?.message ?? recognition.reason)
        : undefined,
    pixelArtError:
      pixelArtUrl.status === "rejected"
        ? String((pixelArtUrl.reason as Error)?.message ?? pixelArtUrl.reason)
        : undefined,
  });
}

async function recognizePlant({
  apiKey,
  dataUrl,
}: {
  apiKey: string;
  dataUrl: string;
}): Promise<RecognizedPlant> {
  const systemPrompt = `你是植物识别 + 养护专家。看图后只返回严格 JSON（无 markdown / 注释 / 说明），字段如下：
{
  "commonName": string,            // 中文俗名，例如 "龟背竹"
  "scientificName": string,        // 拉丁学名，例如 "Monstera deliciosa"
  "heroSubtitle": string,          // 一句 4-12 字的状态短语，例如 "春季养护进行中"
  "growthStage": string,           // 2-3 个字，例如 "萌发" / "生长" / "稳定" / "缓慢"
  "healthStatus": string,          // 4-6 字，例如 "稳定向上" / "需要关注"
  "healthTrend": "up" | "down" | "steady",
  "waterHabit": string,            // 2-3 字，例如 "喜湿" / "喜干" / "适中"
  "sunlightHabit": string,         // 2-3 字，例如 "喜阴" / "喜光"
  "waterAdvice": string,           // 4-6 字，例如 "明天浇水" / "3天后浇"
  "sunlightAdvice": string,        // 4-6 字，例如 "避免暴晒"
  "soilMoisture": number,          // 0-100 估算的当前土壤含水量
  "videoTitle": string,            // 一句视频推荐标题，例如 "龟背竹浇水节奏"
  "videoMeta": string              // 例如 "6 min · 新手友好"
}
若无法判定字段则给出最合理的常识值，但绝不能省略字段。`;

  const userContent: OpenRouterContentPart[] = [
    {
      type: "text",
      text: "请识别这张图中的植物并按要求输出 JSON。",
    },
    {
      type: "image_url",
      image_url: { url: dataUrl },
    },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VISION_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`Vision API failed: ${response.status} ${rawText}`);
  }

  let payload: OpenRouterResponse;
  try {
    payload = JSON.parse(rawText) as OpenRouterResponse;
  } catch {
    throw new Error(`Vision API returned non-JSON: ${rawText}`);
  }

  const text = extractTextContent(payload);
  if (!text) {
    throw new Error("Vision API returned no content.");
  }

  const parsed = safeParseJson(text);
  if (!parsed) {
    throw new Error(`Could not parse vision JSON: ${text}`);
  }

  return {
    commonName: stringOr(parsed.commonName, FALLBACK_PROFILE.commonName),
    scientificName: stringOr(
      parsed.scientificName,
      FALLBACK_PROFILE.scientificName,
    ),
    heroSubtitle: stringOr(parsed.heroSubtitle, FALLBACK_PROFILE.heroSubtitle),
    growthStage: stringOr(parsed.growthStage, FALLBACK_PROFILE.growthStage),
    healthStatus: stringOr(parsed.healthStatus, FALLBACK_PROFILE.healthStatus),
    healthTrend: ((): "up" | "down" | "steady" => {
      const v = String(parsed.healthTrend ?? "").toLowerCase();
      if (v === "up" || v === "down" || v === "steady") {
        return v;
      }
      return FALLBACK_PROFILE.healthTrend;
    })(),
    waterHabit: stringOr(parsed.waterHabit, FALLBACK_PROFILE.waterHabit),
    sunlightHabit: stringOr(
      parsed.sunlightHabit,
      FALLBACK_PROFILE.sunlightHabit,
    ),
    waterAdvice: stringOr(parsed.waterAdvice, FALLBACK_PROFILE.waterAdvice),
    sunlightAdvice: stringOr(
      parsed.sunlightAdvice,
      FALLBACK_PROFILE.sunlightAdvice,
    ),
    soilMoisture: ((): number => {
      const value = Number(parsed.soilMoisture);
      if (!Number.isFinite(value)) {
        return FALLBACK_PROFILE.soilMoisture;
      }
      return Math.max(0, Math.min(100, Math.round(value)));
    })(),
    videoTitle: stringOr(parsed.videoTitle, FALLBACK_PROFILE.videoTitle),
    videoMeta: stringOr(parsed.videoMeta, FALLBACK_PROFILE.videoMeta),
  };
}

async function generatePixelArt({
  apiKey,
  dataUrl,
}: {
  apiKey: string;
  dataUrl: string;
}): Promise<string | null> {
  const prompt = buildPixelPrompt();
  const content: OpenRouterContentPart[] = [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: dataUrl } },
  ];

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: PIXEL_MODEL,
      modalities: ["image"],
      messages: [{ role: "user", content }],
    }),
  });

  const rawText = await response.text();
  if (!response.ok) {
    throw new Error(`Pixel art API failed: ${response.status} ${rawText}`);
  }

  let payload: OpenRouterResponse;
  try {
    payload = JSON.parse(rawText) as OpenRouterResponse;
  } catch {
    throw new Error(`Pixel art API returned non-JSON: ${rawText}`);
  }

  return extractGeneratedImageUrl(payload);
}

function buildPixelPrompt() {
  return "你将收到一张目标植物图。任务：基于这张图生成一张像素风植物插画，并严格保持目标植物的身份、叶片形状、叶片数量分布、枝干结构、生长方向、整体轮廓和花盆形状不变。禁止替换为别的植物或近似品种，禁止凭空增加叶片/花朵/藤蔓/茎杆/多肉结构。背景必须保持简洁的纯色或极简浅背景，让植物成为唯一焦点。整体风格：高完成度的单体盆栽像素插画风、主体居中、边缘清晰、外轮廓有稳定深色描边、明暗分高光-中间色-阴影三档、色彩温暖明快，花盆为陶土红棕系。优先级：第一身份正确，第二结构和轮廓正确，第三像素风表现成立。";
}

function extractTextContent(payload: OpenRouterResponse): string | null {
  const message = payload.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .filter(Boolean)
      .join("\n");
  }
  return null;
}

function extractGeneratedImageUrl(payload: OpenRouterResponse): string | null {
  const message = payload.choices?.[0]?.message;

  const imageFromImages = message?.images?.find(
    (entry) => entry.type === "image_url" && entry.image_url?.url,
  );
  if (imageFromImages?.image_url?.url) {
    return imageFromImages.image_url.url;
  }

  const content = message?.content;
  if (typeof content === "string") {
    return extractImageUrlFromText(content);
  }
  if (Array.isArray(content)) {
    for (const part of content) {
      if (part.type === "image_url" && part.image_url?.url) {
        return part.image_url.url;
      }
      if (typeof part.text === "string") {
        const url = extractImageUrlFromText(part.text);
        if (url) {
          return url;
        }
      }
    }
  }
  return null;
}

function extractImageUrlFromText(text: string): string | null {
  const markdownMatch = text.match(
    /!\[[^\]]*\]\((data:image\/[^)\s]+|https?:\/\/[^)\s]+)\)/,
  );
  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }
  const dataUrlMatch = text.match(
    /data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/i,
  );
  return dataUrlMatch?.[0] ?? null;
}

function safeParseJson(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
    return null;
  }
}

function stringOr(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  return `data:${mime};base64,${bytes.toString("base64")}`;
}
