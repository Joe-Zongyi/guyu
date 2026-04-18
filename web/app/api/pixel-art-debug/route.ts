import { NextResponse } from "next/server";

const DEFAULT_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL ?? "black-forest-labs/flux.2-pro";
const DEFAULT_URL =
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

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY in web env." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const prompt = String(formData.get("prompt") ?? "").trim();
  const sourceImage = formData.get("sourceImage");

  if (!(sourceImage instanceof File) || sourceImage.size === 0) {
    return NextResponse.json(
      { error: "Target image is required." },
      { status: 400 },
    );
  }

  const content: OpenRouterContentPart[] = [
    {
      type: "text",
      text: buildPrompt(prompt),
    },
    {
      type: "image_url",
      image_url: { url: await fileToDataUrl(sourceImage) },
    },
  ];

  const upstreamResponse = await fetch(DEFAULT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      modalities: ["image"],
      messages: [
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  const rawText = await upstreamResponse.text();
  if (!upstreamResponse.ok) {
    return NextResponse.json(
      {
        error: `OpenRouter request failed with ${upstreamResponse.status}.`,
        details: rawText,
      },
      { status: upstreamResponse.status },
    );
  }

  let payload: OpenRouterResponse;
  try {
    payload = JSON.parse(rawText) as OpenRouterResponse;
  } catch {
    return NextResponse.json(
      {
        error: "OpenRouter returned non-JSON content.",
        details: rawText,
      },
      { status: 502 },
    );
  }

  const generatedImageUrl = extractGeneratedImageUrl(payload);

  return NextResponse.json({
    ok: true,
    model: DEFAULT_MODEL,
    endpoint: DEFAULT_URL,
    generatedImageUrl,
    raw: payload,
  });
}

function buildPrompt(userPrompt: string): string {
  const basePrompt =
    "你将收到一张目标植物图。你的任务是基于这张图生成一张像素风植物插画，并且严格保持目标植物的身份不变。硬性要求：目标植物图是唯一的主体身份来源；植物种类、叶片形状、叶片数量分布、枝干或茎杆结构、生长方向、整体轮廓和花盆形状都必须严格遵循目标植物图；禁止把植物变成另一种植物、近似品种或相似外观的别的植物；禁止凭空添加目标图中没有依据的新叶片、新花朵、新藤蔓、新枝干、多肉结构或额外器官；最终结果必须仍然能被清晰识别为目标图中的同一株植物。如果局部细节不明确，应优先保守还原目标图中的植物身份，而不是自由发挥。输出要求：生成干净、精致、适合展示的像素风插画；保留目标图中的花盆和主体植物轮廓；背景保持简洁，不要喧宾夺主；画面重点是把目标图中的真实植物准确地翻译成像素风，而不是重新设计一株植物。优先级顺序：第一，目标植物身份正确；第二，目标植物结构和轮廓正确；第三，像素风表现成立。";

  const styleHint =
    " 内置风格模板要求如下：整体采用高完成度的单体盆栽像素插画风格，主体居中单独展示，构图像游戏素材或图鉴立绘；使用干净的纯色浅背景或极简背景，让植物成为唯一视觉焦点；像素块边缘清晰，轮廓线明确，外轮廓有稳定的深色描边；明暗层次分为清楚的高光、中间色、阴影三档，局部可加入小面积高亮像素表现体积；花盆与植物都要有圆润、可爱、略微理想化但仍然可信的造型；色彩整体明快、温暖、饱和度适中偏高，植物绿色或主体色要鲜明，花盆通常是陶土红棕系；渲染效果接近手工绘制的精品像素资产，而不是松散马赛克滤镜；允许轻微 Q 版、治愈系、游戏道具感，但绝不能因此改变植物种类或器官结构。";

  const userHint = userPrompt
    ? ` 用户补充要求：${userPrompt}`
    : "";

  return `${basePrompt}${styleHint}${userHint}`;
}

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/png";
  return `data:${mime};base64,${bytes.toString("base64")}`;
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
