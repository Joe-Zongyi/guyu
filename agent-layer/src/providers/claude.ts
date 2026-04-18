import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
} from "@anthropic-ai/sdk";
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

export interface ClaudeVisionProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  baseURL?: string;
  resolveImage?: ResolveImageSource;
}

export class ClaudeVisionProvider implements VisionProvider {
  private readonly client: Anthropic;
  private readonly meta: VisionProviderMetadata;
  private readonly resolveImage?: ResolveImageSource;

  constructor(options: ClaudeVisionProviderOptions) {
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

  metadata(): VisionProviderMetadata {
    return this.meta;
  }

  async identifyPlant(
    req: VisionIdentifyRequest,
  ): Promise<VisionIdentifyOutcome> {
    const result = await this.runJson<IdentifyResult>({
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

  async assessPlantState(
    req: VisionAssessRequest,
  ): Promise<VisionAssessOutcome> {
    const result = await this.runJson<AssessResult>({
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

  private async runJson<T>(options: {
    schema: Record<string, unknown>;
    promptVersion: string;
    request: VisionIdentifyRequest | VisionAssessRequest;
    system: string;
  }): Promise<T> {
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
      return JSON.parse(text) as T;
    } catch (error) {
      throw mapAnthropicError(error);
    }
  }
}

function buildIdentifySystemPrompt(region?: string): string {
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

function buildAssessSystemPrompt(taxonomyHint?: string): string {
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

function extractAnthropicText(content: Array<{ type?: string; text?: string }>): string {
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

function normalizeAnthropicImageMediaType(
  mediaType?: string,
): "image/png" | "image/jpeg" | "image/gif" | "image/webp" {
  if (
    mediaType === "image/png" ||
    mediaType === "image/jpeg" ||
    mediaType === "image/gif" ||
    mediaType === "image/webp"
  ) {
    return mediaType;
  }
  return "image/jpeg";
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

function mapAnthropicError(error: unknown): Error {
  if (error instanceof APIConnectionTimeoutError) {
    return makeProviderError("PROVIDER_TIMEOUT", error.message);
  }
  if (error instanceof APIConnectionError || error instanceof APIError) {
    return makeProviderError("PROVIDER_UNAVAILABLE", error.message);
  }
  if (error instanceof Error) return error;
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
