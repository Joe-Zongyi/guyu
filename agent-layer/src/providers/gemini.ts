import { GoogleGenAI, createPartFromBase64, createPartFromUri } from "@google/genai";
import type { StateSignal } from "../schemas/enums.js";
import { resolveImageSource, type ResolveImageSource } from "./imageSource.js";
import {
  makeProviderError,
  type VisionAssessOutcome,
  type VisionAssessRequest,
  type VisionIdentifyOutcome,
  type VisionIdentifyRequest,
  type VisionProvider,
  type VisionProviderMetadata,
} from "./types.js";

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
} as const;

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
} as const;

export interface GeminiVisionProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  resolveImage?: ResolveImageSource;
}

export class GeminiVisionProvider implements VisionProvider {
  private readonly client: GoogleGenAI;
  private readonly meta: VisionProviderMetadata;
  private readonly resolveImage?: ResolveImageSource;
  private readonly timeoutMs?: number;

  constructor(options: GeminiVisionProviderOptions) {
    this.client = new GoogleGenAI({ apiKey: options.apiKey });
    this.meta = {
      model: options.model ?? "gemini-2.5-flash",
      identify_prompt_version: IDENTIFY_PROMPT_VERSION,
      assess_prompt_version: ASSESS_PROMPT_VERSION,
    };
    this.resolveImage = options.resolveImage;
    this.timeoutMs = options.timeoutMs;
  }

  metadata(): VisionProviderMetadata {
    return this.meta;
  }

  async identifyPlant(
    req: VisionIdentifyRequest,
  ): Promise<VisionIdentifyOutcome> {
    const result = await this.runJson<IdentifyResult>({
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

  async assessPlantState(
    req: VisionAssessRequest,
  ): Promise<VisionAssessOutcome> {
    const result = await this.runJson<AssessResult>({
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

  private async runJson<T>(options: {
    schema: Record<string, unknown>;
    systemInstruction: string;
    request: VisionIdentifyRequest | VisionAssessRequest;
  }): Promise<T> {
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
      return JSON.parse(text) as T;
    } catch (error) {
      throw mapGeminiError(error);
    }
  }
}

function buildIdentifyInstruction(region?: string): string {
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

function buildAssessInstruction(taxonomyHint?: string): string {
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

function buildUserContext(request: VisionIdentifyRequest | VisionAssessRequest) {
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

function sanitizeCandidates(input: unknown): Array<{ taxonomy_hint: string; confidence: number }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      const taxonomyHint = typeof candidate.taxonomy_hint === "string"
        ? candidate.taxonomy_hint.trim()
        : "";
      if (!taxonomyHint) return undefined;
      return {
        taxonomy_hint: taxonomyHint,
        confidence: clamp01(candidate.confidence),
      };
    })
    .filter((item): item is { taxonomy_hint: string; confidence: number } =>
      item !== undefined,
    )
    .slice(0, 4);
}

function sanitizeSignals(input: unknown): Array<{ signal: StateSignal; confidence: number }> {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      const signal = item as Record<string, unknown>;
      const name = typeof signal.signal === "string" ? signal.signal.trim() : "";
      if (!isStateSignal(name)) return undefined;
      return { signal: name, confidence: clamp01(signal.confidence) };
    })
    .filter((item): item is { signal: StateSignal; confidence: number } => item !== undefined);
}

function normalizePlantCount(input: unknown): number {
  return Math.max(0, Math.round(toFiniteNumber(input, 1)));
}

const STATE_SIGNALS = new Set<StateSignal>([
  "slightly_wilted_leaves",
  "yellowing_tip",
  "leaf_droop",
  "new_growth_visible",
  "stable_appearance",
  "unknown",
]);

function isStateSignal(value: string): value is StateSignal {
  return STATE_SIGNALS.has(value as StateSignal);
}

function clamp01(input: unknown): number {
  const value = toFiniteNumber(input, 0);
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function toFiniteNumber(input: unknown, fallback: number): number {
  return typeof input === "number" && Number.isFinite(input) ? input : fallback;
}

function mapGeminiError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("timeout") || message.includes("timed out")) {
      return makeProviderError("PROVIDER_TIMEOUT", error.message);
    }
    if (
      message.includes("503") ||
      message.includes("502") ||
      message.includes("500") ||
      message.includes("unavailable") ||
      message.includes("connection") ||
      message.includes("network")
    ) {
      return makeProviderError("PROVIDER_UNAVAILABLE", error.message);
    }
    return error;
  }
  return new Error(String(error));
}

type IdentifyResult = {
  kind: "identified" | "no_plant" | "blurry" | "multiple_plants";
  image_quality?: "ok" | "blurry";
  detected_plant_count?: number;
  candidates?: Array<{ taxonomy_hint?: string; confidence?: number }>;
};

type AssessResult = {
  signals?: Array<{ signal?: string; confidence?: number }>;
  overall_confidence?: number;
  image_quality?: "ok" | "blurry";
  detected_plant?: boolean;
  raw_notes?: string;
};
