import type { FileRef } from "../schemas/primitives.js";
export interface ImageGenerationRequest {
    image: FileRef;
    request_id: string;
    prompt?: string;
    style_references?: FileRef[];
    variants?: number;
}
export interface GeneratedImageDraft {
    url: string;
    content_type?: string;
    width?: number;
    height?: number;
}
export interface ImageGenerationMetadata {
    model: string;
    prompt_version: string;
}
export interface ImageGenerationProvider {
    metadata(): ImageGenerationMetadata;
    generatePixelArt(req: ImageGenerationRequest): Promise<GeneratedImageDraft[]>;
}
//# sourceMappingURL=imageGeneration.d.ts.map