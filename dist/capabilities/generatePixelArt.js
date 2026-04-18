import { GeneratePixelArtInputSchema, } from "../schemas/inputs.js";
import { isProviderError } from "../providers/types.js";
const DEFAULT_PROMPT = "Generate a polished pixel-art version of this plant image. Keep the plant and pot recognizable, use a clean retro sprite aesthetic, and avoid photorealism.";
export async function generatePixelArt(rawInput, deps) {
    const parsed = GeneratePixelArtInputSchema.safeParse(rawInput);
    if (!parsed.success) {
        return {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: `invalid input: ${parsed.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("; ")}`,
            request_id: rawInput?.request_id ?? "unknown",
        };
    }
    const input = parsed.data;
    let generatedDrafts;
    try {
        generatedDrafts = await deps.imageGenerationProvider.generatePixelArt({
            image: input.image,
            request_id: input.request_id,
            ...(input.prompt !== undefined
                ? { prompt: `${DEFAULT_PROMPT} ${input.prompt}` }
                : { prompt: DEFAULT_PROMPT }),
            ...(input.style_references.length > 0
                ? { style_references: input.style_references }
                : {}),
            variants: input.variants,
        });
    }
    catch (err) {
        if (isProviderError(err)) {
            return {
                status: "failed",
                error_code: err.code,
                message: err.message,
                request_id: input.request_id,
            };
        }
        return {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: `provider error: ${err.message ?? "unknown"}`,
            request_id: input.request_id,
        };
    }
    if (generatedDrafts.length === 0) {
        return {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: "provider returned no generated images",
            request_id: input.request_id,
        };
    }
    try {
        const images = await Promise.all(generatedDrafts.map((image, index) => deps.generatedImageStore.saveGeneratedImage({
            request_id: input.request_id,
            source_image_id: input.image.file_id,
            image,
            index,
        })));
        const result = {
            source_image_id: input.image.file_id,
            style: "pixel_art",
            images,
            provider_metadata: deps.imageGenerationProvider.metadata(),
        };
        return {
            status: "success",
            data: result,
            request_id: input.request_id,
        };
    }
    catch (err) {
        return {
            status: "failed",
            error_code: "PROVIDER_UNAVAILABLE",
            message: `failed to persist generated images: ${err.message ?? "unknown"}`,
            request_id: input.request_id,
        };
    }
}
//# sourceMappingURL=generatePixelArt.js.map