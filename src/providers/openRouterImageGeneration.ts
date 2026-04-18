import { makeProviderError, isProviderError } from "./types.js";
import type {
  GeneratedImageDraft,
  ImageGenerationProvider,
  ImageGenerationMetadata,
  ImageGenerationRequest,
} from "./imageGeneration.js";

interface OpenRouterChatImage {
  type?: string;
  image_url?: {
    url?: string;
  };
}

interface OpenRouterChatContentPart {
  type?: string;
  text?: string;
  image_url?: {
    url?: string;
  };
}

interface OpenRouterChatChoice {
  message?: {
    images?: OpenRouterChatImage[];
    content?: string | OpenRouterChatContentPart[];
  };
}

interface OpenRouterChatCompletionResponse {
  choices?: OpenRouterChatChoice[];
}

export interface OpenRouterImageGenerationProviderOptions {
  apiKey: string;
  model?: string;
  promptVersion?: string;
  baseUrl?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
}

const DEFAULT_MODEL = "black-forest-labs/flux.2-pro";
const DEFAULT_PROMPT_VERSION = "pixel-art-v1";
const DEFAULT_TIMEOUT_MS = 30_000;

export class OpenRouterImageGenerationProvider
  implements ImageGenerationProvider
{
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly extraHeaders: Record<string, string>;
  private readonly meta: ImageGenerationMetadata;

  constructor(options: OpenRouterImageGenerationProviderOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://openrouter.ai/api/v1";
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.extraHeaders = options.headers ?? {};
    this.meta = {
      model: options.model ?? DEFAULT_MODEL,
      prompt_version: options.promptVersion ?? DEFAULT_PROMPT_VERSION,
    };
  }

  metadata(): ImageGenerationMetadata {
    return this.meta;
  }

  async generatePixelArt(
    req: ImageGenerationRequest,
  ): Promise<GeneratedImageDraft[]> {
    const imageUrl = req.image.url;
    if (!imageUrl) {
      throw makeProviderError(
        "PROVIDER_UNAVAILABLE",
        "image.url is required for OpenRouter image generation",
      );
    }

    const styleReferenceUrls = (req.style_references ?? []).map((ref, index) => {
      if (!ref.url) {
        throw makeProviderError(
          "PROVIDER_UNAVAILABLE",
          `style_references.${index}.url is required for OpenRouter image generation`,
        );
      }
      return ref.url;
    });

    const variants = Math.max(1, req.variants ?? 1);
    const prompt = buildPixelArtPrompt(req.prompt, styleReferenceUrls.length);
    const generated = await Promise.all(
      Array.from({ length: variants }, () =>
        this.generateSingleImage(imageUrl, styleReferenceUrls, prompt),
      ),
    );

    return generated;
  }

  private async generateSingleImage(
    imageUrl: string,
    styleReferenceUrls: string[],
    prompt: string,
  ): Promise<GeneratedImageDraft> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          ...this.extraHeaders,
        },
        body: JSON.stringify({
          model: this.meta.model,
          modalities: ["image"],
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } },
                ...styleReferenceUrls.map((url) => ({
                  type: "image_url",
                  image_url: { url },
                })),
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await response.text();
        throw makeProviderError(
          "PROVIDER_UNAVAILABLE",
          `openrouter error ${response.status}: ${details || response.statusText}`,
        );
      }

      const payload =
        (await response.json()) as OpenRouterChatCompletionResponse;
      const imageUrl = extractGeneratedImageUrl(payload);

      if (!imageUrl) {
        throw makeProviderError(
          "PROVIDER_UNAVAILABLE",
          "openrouter response did not include a generated image",
        );
      }

      return {
        url: imageUrl,
        content_type: guessContentType(imageUrl),
      };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw makeProviderError("PROVIDER_TIMEOUT", "openrouter request timed out");
      }
      if (isProviderError(err)) {
        throw err;
      }
      throw makeProviderError(
        "PROVIDER_UNAVAILABLE",
        `openrouter request failed: ${(err as Error).message ?? "unknown"}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function extractGeneratedImageUrl(
  payload: OpenRouterChatCompletionResponse,
): string | undefined {
  const message = payload.choices?.[0]?.message;
  const image = message?.images?.find(
    (entry) => entry.type === "image_url" && entry.image_url?.url,
  );
  if (image?.image_url?.url) {
    return image.image_url.url;
  }
  return extractImageUrlFromContent(message?.content);
}

function extractImageUrlFromContent(
  content: string | OpenRouterChatContentPart[] | undefined,
): string | undefined {
  if (typeof content === "string") {
    return extractImageUrlFromText(content);
  }
  if (!Array.isArray(content)) {
    return undefined;
  }

  for (const part of content) {
    if (part.type === "image_url" && part.image_url?.url) {
      return part.image_url.url;
    }
    if (typeof part.text === "string") {
      const imageUrl = extractImageUrlFromText(part.text);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  return undefined;
}

function extractImageUrlFromText(text: string): string | undefined {
  const markdownMatch = text.match(
    /!\[[^\]]*\]\((data:image\/[^)\s]+|https?:\/\/[^)\s]+)\)/,
  );
  if (markdownMatch?.[1]) {
    return markdownMatch[1];
  }

  const dataUrlMatch = text.match(/data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/=]+/i);
  return dataUrlMatch?.[0];
}

function buildPixelArtPrompt(
  userPrompt: string | undefined,
  styleReferenceCount: number,
): string {
  const base =
    "Generate a crisp pixel art illustration of the plant in the input image. Keep the plant species, pot, and overall silhouette recognizable. Use a retro game sprite style, simple clean background, visible pixel structure, and vivid but natural plant colors.";

  const styleHint =
    styleReferenceCount > 0
      ? ` Match the supplied style reference images while keeping the source plant identifiable. ${styleReferenceCount} style reference image(s) are attached after the source image.`
      : "";

  const promptSuffix = userPrompt?.trim()
    ? ` Additional user guidance: ${userPrompt.trim()}`
    : "";

  return `${base}${styleHint}${promptSuffix}`;
}

function guessContentType(url: string): string | undefined {
  if (url.startsWith("data:image/png")) return "image/png";
  if (url.startsWith("data:image/jpeg")) return "image/jpeg";
  if (url.endsWith(".png")) return "image/png";
  if (url.endsWith(".jpg") || url.endsWith(".jpeg")) return "image/jpeg";
  return undefined;
}
