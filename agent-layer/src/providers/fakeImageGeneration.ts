import {
  makeProviderError,
  type ProviderError,
} from "./types.js";
import type {
  GeneratedImageDraft,
  ImageGenerationProvider,
  ImageGenerationMetadata,
  ImageGenerationRequest,
} from "./imageGeneration.js";

const DEFAULT_METADATA: ImageGenerationMetadata = {
  model: "fake-pixel-art-v1",
  prompt_version: "pixel-art-v1",
};

export interface FakeImageGenerationProviderOptions {
  metadata?: Partial<ImageGenerationMetadata>;
}

export class FakeImageGenerationProvider implements ImageGenerationProvider {
  private readonly meta: ImageGenerationMetadata;

  constructor(options: FakeImageGenerationProviderOptions = {}) {
    this.meta = { ...DEFAULT_METADATA, ...options.metadata };
  }

  metadata(): ImageGenerationMetadata {
    return this.meta;
  }

  async generatePixelArt(
    req: ImageGenerationRequest,
  ): Promise<GeneratedImageDraft[]> {
    const tag = req.image.file_id.toLowerCase();

    if (tag.includes("timeout")) {
      throw makeProviderError("PROVIDER_TIMEOUT", "fake provider timeout");
    }
    if (tag.includes("unavailable")) {
      throw makeProviderError(
        "PROVIDER_UNAVAILABLE",
        "fake provider unavailable",
      );
    }

    const variants = Math.max(1, req.variants ?? 1);
    return Array.from({ length: variants }, (_, index) => ({
      url: `https://provider.example.com/generated/${req.image.file_id}-${index + 1}.png`,
      content_type: "image/png",
      width: 512,
      height: 512,
    }));
  }
}

export function isImageGenerationProviderError(
  err: unknown,
): err is ProviderError {
  return (
    err instanceof Error &&
    "code" in err &&
    (err.code === "PROVIDER_TIMEOUT" || err.code === "PROVIDER_UNAVAILABLE")
  );
}
