import type { PixelArtGenerationResponse } from "../schemas/envelopes.js";
import type { GeneratedImageStore } from "../assets/types.js";
import type { ImageGenerationProvider } from "../providers/imageGeneration.js";
export interface GeneratePixelArtDeps {
    imageGenerationProvider: ImageGenerationProvider;
    generatedImageStore: GeneratedImageStore;
}
export declare function generatePixelArt(rawInput: unknown, deps: GeneratePixelArtDeps): Promise<PixelArtGenerationResponse>;
//# sourceMappingURL=generatePixelArt.d.ts.map