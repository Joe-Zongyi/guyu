import type { GeneratedImage } from "../schemas/imageGeneration.js";
import type { GeneratedImageDraft } from "../providers/imageGeneration.js";

export interface GeneratedImageStoreRequest {
  request_id: string;
  source_image_id: string;
  image: GeneratedImageDraft;
  index: number;
}

export interface GeneratedImageStore {
  saveGeneratedImage(req: GeneratedImageStoreRequest): Promise<GeneratedImage>;
}
