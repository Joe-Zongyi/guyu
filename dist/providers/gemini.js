import { GoogleGenAI, createPartFromBase64, createPartFromUri } from "@google/genai";
import { resolveImageSource } from "./imageSource.js";
import { makeProviderError, } from "./types.js";
const IDENTIFY_PROMPT_VERSION = "gemini-identify-v1";
const ASSESS_PROMPT_VERSION = "gemini-assess-v1";
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
export class GeminiVisionProvider {
    client;
    meta;
    resolveImage;
    timeoutMs;
    constructor(options) {
        this.client = new GoogleGenAI({ apiKey: options.apiKey });
        this.meta = {
            model: options.model ?? "gemini-2.5-flash",
            identify_prompt_version: IDENTIFY_PROMPT_VERSION,
            assess_prompt_version: ASSESS_PROMPT_VERSION,
        };
        this.resolveImage = options.resolveImage;
        this.timeoutMs = options.timeoutMs;
    }
    metadata() {
        return this.meta;
    }
    async identifyPlant(req) {
        const result = await this.runJson({
            schema: IDENTIFY_SCHEMA,
            systemInstruction: buildIdentifyInstruction(req.region),
            request: req,
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
            systemInstruction: buildAssessInstruction(req.taxonomy_hint),
            request: req,
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
            const response = await this.client.models.generateContent({
                model: this.meta.model,
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: JSON.stringify(buildUserContext(options.request)) },
                            image.kind === "url"
                                ? createPartFromUri(image.url, image.mimeType ?? "image/jpeg")
                                : createPartFromBase64(image.data, image.mimeType),
                        ],
                    },
                ],
                config: {
                    systemInstruction: options.systemInstruction,
                    responseMimeType: "application/json",
                    responseJsonSchema: options.schema,
                    ...(this.timeoutMs
                        ? { httpOptions: { timeout: this.timeoutMs } }
                        : {}),
                },
            });
            const text = response.text?.trim();
            if (!text) {
                throw new Error("empty response from gemini provider");
            }
            return JSON.parse(text);
        }
        catch (error) {
            throw mapGeminiError(error);
        }
    }
}
function buildIdentifyInstruction(region) {
    return [
        "You are a plant vision classifier.",
        "Return JSON only.",
        "Use kind=blurry for unusable images.",
        "Use kind=no_plant when no plant is visible.",
        "Use kind=multiple_plants when multiple distinct plants are visible.",
        "For identified, include up to 4 taxonomy hints with confidence 0 to 1.",
        region ? `User region hint: ${region}.` : undefined,
    ]
        .filter(Boolean)
        .join(" ");
}
function buildAssessInstruction(taxonomyHint) {
    return [
        "You are a plant health vision assessor.",
        "Return JSON only.",
        "Use only visible image evidence.",
        "Be conservative on confidence.",
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
function mapGeminiError(error) {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes("timeout") || message.includes("timed out")) {
            return makeProviderError("PROVIDER_TIMEOUT", error.message);
        }
        if (message.includes("503") ||
            message.includes("502") ||
            message.includes("500") ||
            message.includes("unavailable") ||
            message.includes("connection") ||
            message.includes("network")) {
            return makeProviderError("PROVIDER_UNAVAILABLE", error.message);
        }
        return error;
    }
    return new Error(String(error));
}
//# sourceMappingURL=gemini.js.map