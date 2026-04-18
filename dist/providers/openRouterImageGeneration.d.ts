import type { GeneratedImageDraft, ImageGenerationProvider, ImageGenerationMetadata, ImageGenerationRequest } from "./imageGeneration.js";
export interface OpenRouterImageGenerationProviderOptions {
    apiKey: string;
    model?: string;
    promptVersion?: string;
    baseUrl?: string;
    timeoutMs?: number;
    headers?: Record<string, string>;
}
export declare class OpenRouterImageGenerationProvider implements ImageGenerationProvider {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeoutMs;
    private readonly extraHeaders;
    private readonly meta;
    constructor(options: OpenRouterImageGenerationProviderOptions);
    metadata(): ImageGenerationMetadata;
    generatePixelArt(req: ImageGenerationRequest): Promise<GeneratedImageDraft[]>;
    private generateSingleImage;
}
//# sourceMappingURL=openRouterImageGeneration.d.ts.map