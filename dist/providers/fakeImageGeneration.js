import { makeProviderError, } from "./types.js";
const DEFAULT_METADATA = {
    model: "fake-pixel-art-v1",
    prompt_version: "pixel-art-v1",
};
export class FakeImageGenerationProvider {
    meta;
    constructor(options = {}) {
        this.meta = { ...DEFAULT_METADATA, ...options.metadata };
    }
    metadata() {
        return this.meta;
    }
    async generatePixelArt(req) {
        const tag = req.image.file_id.toLowerCase();
        if (tag.includes("timeout")) {
            throw makeProviderError("PROVIDER_TIMEOUT", "fake provider timeout");
        }
        if (tag.includes("unavailable")) {
            throw makeProviderError("PROVIDER_UNAVAILABLE", "fake provider unavailable");
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
export function isImageGenerationProviderError(err) {
    return (err instanceof Error &&
        "code" in err &&
        (err.code === "PROVIDER_TIMEOUT" || err.code === "PROVIDER_UNAVAILABLE"));
}
//# sourceMappingURL=fakeImageGeneration.js.map