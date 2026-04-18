import { type ProviderError } from "./types.js";
import type { GeneratedImageDraft, ImageGenerationProvider, ImageGenerationMetadata, ImageGenerationRequest } from "./imageGeneration.js";
export interface FakeImageGenerationProviderOptions {
    metadata?: Partial<ImageGenerationMetadata>;
}
export declare class FakeImageGenerationProvider implements ImageGenerationProvider {
    private readonly meta;
    constructor(options?: FakeImageGenerationProviderOptions);
    metadata(): ImageGenerationMetadata;
    generatePixelArt(req: ImageGenerationRequest): Promise<GeneratedImageDraft[]>;
}
export declare function isImageGenerationProviderError(err: unknown): err is ProviderError;
//# sourceMappingURL=fakeImageGeneration.d.ts.map