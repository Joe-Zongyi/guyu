import { newId } from "../util/id.js";
import type {
  GeneratedImageStore,
  GeneratedImageStoreRequest,
} from "./types.js";

export interface FakeGeneratedImageStoreOptions {
  baseUrl?: string;
  generateId?: (req: GeneratedImageStoreRequest) => string;
}

export class FakeGeneratedImageStore implements GeneratedImageStore {
  private readonly baseUrl: string;
  private readonly generateId: (req: GeneratedImageStoreRequest) => string;

  constructor(options: FakeGeneratedImageStoreOptions = {}) {
    this.baseUrl = options.baseUrl ?? "https://assets.example.com/generated";
    this.generateId =
      options.generateId ?? (() => newId("generated_image"));
  }

  async saveGeneratedImage(req: GeneratedImageStoreRequest) {
    const fileId = this.generateId(req);
    return {
      file_id: fileId,
      url: `${this.baseUrl}/${fileId}.png`,
      ...(req.image.content_type !== undefined
        ? { content_type: req.image.content_type }
        : {}),
      ...(req.image.width !== undefined ? { width: req.image.width } : {}),
      ...(req.image.height !== undefined ? { height: req.image.height } : {}),
    };
  }
}
