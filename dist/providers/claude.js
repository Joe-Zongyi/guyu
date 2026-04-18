import Anthropic, { APIConnectionError, APIConnectionTimeoutError, APIError, } from "@anthropic-ai/sdk";
import { resolveImageSource } from "./imageSource.js";
import { makeProviderError, } from "./types.js";
const IDENTIFY_PROMPT_VERSION = "claude-identify-v1";
const ASSESS_PROMPT_VERSION = "claude-assess-v1";
const IDENTIFY_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: ["kind"],
    properties: {
        kind: {
            type: "string",
            enum: ["identified", "no_plant", "blurry", "multiple_plants"],
        },
        image_quality: { type: "string", enum: ["ok", "blurry"] },
        detected_plant_count: { type: "number" },
        candidates: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["taxonomy_hint", "confidence"],
                properties: {
                    taxonomy_hint: { type: "string" },
                    confidence: { type: "number" },
                },
            },
        },
    },
};
const ASSESS_SCHEMA = {
    type: "object",
    additionalProperties: false,
    required: [
        "signals",
        "overall_confidence",
        "image_quality",
        "detected_plant",
    ],
    properties: {
        signals: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["signal", "confidence"],
                properties: {
                    signal: { type: "string" },
                    confidence: { type: "number" },
                },
            },
        },
        overall_confidence: { type: "number" },
        image_quality: { type: "string", enum: ["ok", "blurry"] },
        detected_plant: { type: "boolean" },
        raw_notes: { type: "string" },
    },
};
export class ClaudeVisionProvider {
    client;
    meta;
    resolveImage;
    constructor(options) {
        this.client = new Anthropic({
            apiKey: options.apiKey,
            ...(options.timeoutMs ? { timeout: options.timeoutMs } : {}),
            ...(options.baseURL ? { baseURL: options.baseURL } : {}),
        });
        this.meta = {
            model: options.model ?? "claude-opus-4-7",
            identify_prompt_version: IDENTIFY_PROMPT_VERSION,
            assess_prompt_version: ASSESS_PROMPT_VERSION,
        };
        this.resolveImage = options.resolveImage;
    }
    metadata() {
        return this.meta;
    }
    async identifyPlant(req) {
        const result = await this.runJson({
            schema: IDENTIFY_SCHEMA,
            promptVersion: IDENTIFY_PROMPT_VERSION,
            request: req,
            system: buildIdentifySystemPrompt(req.region),
        });
        if (result.kind !== "identified") {
            return { kind: result.kind };
        }
        return {
            kind: "identified",
            candidates: sanitizeCandidates(result.candidates),
            image_quality: result.image_quality === "blurry" ? "blurry" : "ok",
            detected_plant_count: normalizePlantCount(result.detected_plant_count),
        };
    }
    async assessPlantState(req) {
        const result = await this.runJson({
            schema: ASSESS_SCHEMA,
            promptVersion: ASSESS_PROMPT_VERSION,
            request: req,
            system: buildAssessSystemPrompt(req.taxonomy_hint),
        });
        return {
            signals: sanitizeSignals(result.signals),
            overall_confidence: clamp01(result.overall_confidence),
            image_quality: result.image_quality === "blurry" ? "blurry" : "ok",
            detected_plant: result.detected_plant !== false,
            ...(result.raw_notes ? { raw_notes: result.raw_notes } : {}),
        };
    }
    async runJson(options) {
        try {
            const image = await resolveImageSource(options.request.image, {
                resolveImage: this.resolveImage,
            });
            const message = await this.client.messages.create({
                model: this.meta.model,
                max_tokens: 800,
                system: options.system,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: JSON.stringify(buildUserContext(options.request)) },
                            image.kind === "url"
                                ? {
                                    type: "image",
                                    source: { type: "url", url: image.url },
                                }
                                : {
                                    type: "image",
                                    source: {
                                        type: "base64",
                                        media_type: normalizeAnthropicImageMediaType(image.mimeType),
                                        data: image.data,
                                    },
                                },
                        ],
                    },
                ],
            });
            const text = extractAnthropicText(message.content);
            return JSON.parse(text);
        }
        catch (error) {
            throw mapAnthropicError(error);
        }
    }
}
function buildIdentifySystemPrompt(region) {
    return [
        "You are a plant vision classifier.",
        "Return only JSON matching the schema.",
        "Choose kind=blurry for unusable images.",
        "Choose kind=no_plant if no plant is visible.",
        "Choose kind=multiple_plants if more than one distinct plant is visible.",
        "For identified, provide up to 4 normalized taxonomy hints and confidence values from 0 to 1.",
        region ? `User region hint: ${region}.` : undefined,
    ]
        .filter(Boolean)
        .join(" ");
}
function buildAssessSystemPrompt(taxonomyHint) {
    return [
        "You are a plant health vision assessor.",
        "Return only JSON matching the schema.",
        "Use only observable image evidence.",
        "Prefer conservative confidence when the image is uncertain.",
        taxonomyHint ? `Taxonomy hint: ${taxonomyHint}.` : undefined,
    ]
        .filter(Boolean)
        .join(" ");
}
function buildUserContext(request) {
    return {
        request_id: request.request_id,
        file_id: request.image.file_id,
        ...(request.image.content_type
            ? { content_type: request.image.content_type }
            : {}),
        ...(request.image.captured_at
            ? { captured_at: request.image.captured_at }
            : {}),
        ...("region" in request && request.region ? { region: request.region } : {}),
        ...("taxonomy_hint" in request && request.taxonomy_hint
            ? { taxonomy_hint: request.taxonomy_hint }
            : {}),
    };
}
function extractAnthropicText(content) {
    const joined = content
        .filter((block) => block.type === "text")
        .map((block) => String(block.text ?? ""))
        .join("\n")
        .trim();
    if (!joined) {
        throw new Error("empty response from anthropic provider");
    }
    return joined;
}
function sanitizeCandidates(input) {
    if (!Array.isArray(input))
        return [];
    return input
        .map((item) => {
        const candidate = item;
        const taxonomyHint = typeof candidate.taxonomy_hint === "string"
            ? candidate.taxonomy_hint.trim()
            : "";
        if (!taxonomyHint)
            return undefined;
        return {
            taxonomy_hint: taxonomyHint,
            confidence: clamp01(candidate.confidence),
        };
    })
        .filter((item) => item !== undefined)
        .slice(0, 4);
}
function sanitizeSignals(input) {
    if (!Array.isArray(input))
        return [];
    return input
        .map((item) => {
        const signal = item;
        const name = typeof signal.signal === "string" ? signal.signal.trim() : "";
        if (!isStateSignal(name))
            return undefined;
        return { signal: name, confidence: clamp01(signal.confidence) };
    })
        .filter((item) => item !== undefined);
}
function normalizePlantCount(input) {
    return Math.max(0, Math.round(toFiniteNumber(input, 1)));
}
const STATE_SIGNALS = new Set([
    "slightly_wilted_leaves",
    "yellowing_tip",
    "leaf_droop",
    "new_growth_visible",
    "stable_appearance",
    "unknown",
]);
function isStateSignal(value) {
    return STATE_SIGNALS.has(value);
}
function normalizeAnthropicImageMediaType(mediaType) {
    if (mediaType === "image/png" ||
        mediaType === "image/jpeg" ||
        mediaType === "image/gif" ||
        mediaType === "image/webp") {
        return mediaType;
    }
    return "image/jpeg";
}
function clamp01(input) {
    const value = toFiniteNumber(input, 0);
    if (value < 0)
        return 0;
    if (value > 1)
        return 1;
    return value;
}
function toFiniteNumber(input, fallback) {
    return typeof input === "number" && Number.isFinite(input) ? input : fallback;
}
function mapAnthropicError(error) {
    if (error instanceof APIConnectionTimeoutError) {
        return makeProviderError("PROVIDER_TIMEOUT", error.message);
    }
    if (error instanceof APIConnectionError || error instanceof APIError) {
        return makeProviderError("PROVIDER_UNAVAILABLE", error.message);
    }
    if (error instanceof Error)
        return error;
    return new Error(String(error));
}
//# sourceMappingURL=claude.js.map