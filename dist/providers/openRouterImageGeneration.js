import { makeProviderError, isProviderError } from "./types.js";
const DEFAULT_MODEL = "black-forest-labs/flux.2-pro";
const DEFAULT_PROMPT_VERSION = "pixel-art-v1";
const DEFAULT_TIMEOUT_MS = 30_000;
export class OpenRouterImageGenerationProvider {
    apiKey;
    baseUrl;
    timeoutMs;
    extraHeaders;
    meta;
    constructor(options) {
        this.apiKey = options.apiKey;
        this.baseUrl = options.baseUrl ?? "https://openrouter.ai/api/v1";
        this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
        this.extraHeaders = options.headers ?? {};
        this.meta = {
            model: options.model ?? DEFAULT_MODEL,
            prompt_version: options.promptVersion ?? DEFAULT_PROMPT_VERSION,
        };
    }
    metadata() {
        return this.meta;
    }
    async generatePixelArt(req) {
        const imageUrl = req.image.url;
        if (!imageUrl) {
            throw makeProviderError("PROVIDER_UNAVAILABLE", "image.url is required for OpenRouter image generation");
        }
        const styleReferenceUrls = (req.style_references ?? []).map((ref, index) => {
            if (!ref.url) {
                throw makeProviderError("PROVIDER_UNAVAILABLE", `style_references.${index}.url is required for OpenRouter image generation`);
            }
            return ref.url;
        });
        const variants = Math.max(1, req.variants ?? 1);
        const prompt = buildPixelArtPrompt(req.prompt, styleReferenceUrls.length);
        const generated = await Promise.all(Array.from({ length: variants }, () => this.generateSingleImage(imageUrl, styleReferenceUrls, prompt)));
        return generated;
    }
    async generateSingleImage(imageUrl, styleReferenceUrls, prompt) {
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
                throw makeProviderError("PROVIDER_UNAVAILABLE", `openrouter error ${response.status}: ${details || response.statusText}`);
            }
            const payload = (await response.json());
            const image = payload.choices?.[0]?.message?.images?.find((entry) => entry.type === "image_url" && entry.image_url?.url);
            if (!image?.image_url?.url) {
                throw makeProviderError("PROVIDER_UNAVAILABLE", "openrouter response did not include a generated image");
            }
            return {
                url: image.image_url.url,
                content_type: guessContentType(image.image_url.url),
            };
        }
        catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                throw makeProviderError("PROVIDER_TIMEOUT", "openrouter request timed out");
            }
            if (isProviderError(err)) {
                throw err;
            }
            throw makeProviderError("PROVIDER_UNAVAILABLE", `openrouter request failed: ${err.message ?? "unknown"}`);
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
function buildPixelArtPrompt(userPrompt, styleReferenceCount) {
    const base = "Generate a crisp pixel art illustration of the plant in the input image. Keep the plant species, pot, and overall silhouette recognizable. Use a retro game sprite style, simple clean background, visible pixel structure, and vivid but natural plant colors.";
    const styleHint = styleReferenceCount > 0
        ? ` Match the supplied style reference images while keeping the source plant identifiable. ${styleReferenceCount} style reference image(s) are attached after the source image.`
        : "";
    const promptSuffix = userPrompt?.trim()
        ? ` Additional user guidance: ${userPrompt.trim()}`
        : "";
    return `${base}${styleHint}${promptSuffix}`;
}
function guessContentType(url) {
    if (url.startsWith("data:image/png"))
        return "image/png";
    if (url.startsWith("data:image/jpeg"))
        return "image/jpeg";
    if (url.endsWith(".png"))
        return "image/png";
    if (url.endsWith(".jpg") || url.endsWith(".jpeg"))
        return "image/jpeg";
    return undefined;
}
//# sourceMappingURL=openRouterImageGeneration.js.map