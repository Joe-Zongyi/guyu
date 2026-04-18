import { newId } from "../util/id.js";
import type {
  GeneratedImageStore,
  GeneratedImageStoreRequest,
} from "./types.js";

export interface PassthroughGeneratedImageStoreOptions {
  generateId?: (req: GeneratedImageStoreRequest) => string;
}

export class PassthroughGeneratedImageStore implements GeneratedImageStore {
  private readonly generateId: (req: GeneratedImageStoreRequest) => string;

  constructor(options: PassthroughGeneratedImageStoreOptions = {}) {
    this.generateId = options.generateId ?? (() => newId("generated_image"));
  }

  async saveGeneratedImage(req: GeneratedImageStoreRequest) {
    return {
      file_id: this.generateId(req),
      url: req.image.url,
      ...(req.image.content_type !== undefined
        ? { content_type: req.image.content_type }
        : {}),
      ...(req.image.width !== undefined ? { width: req.image.width } : {}),
      ...(req.image.height !== undefined ? { height: req.image.height } : {}),
    };
  }
}
