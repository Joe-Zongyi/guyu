import OpenAI, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
} from "openai";
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

const IDENTIFY_PROMPT_VERSION = "openai-identify-v1";
const ASSESS_PROMPT_VERSION = "openai-assess-v1";


export interface OpenAICompatibleVisionProviderOptions {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
  baseURL?: string;
  resolveImage?: ResolveImageSource;
}

export class OpenAICompatibleVisionProvider implements VisionProvider {
  private readonly client: OpenAI;
  private readonly meta: VisionProviderMetadata;
  private readonly resolveImage?: ResolveImageSource;

  constructor(options: OpenAICompatibleVisionProviderOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
      ...(options.timeoutMs ? { timeout: options.timeoutMs } : {}),
      ...(options.baseURL ? { baseURL: options.baseURL } : {}),
    });
    this.meta = {
      model: options.model ?? "gpt-4.1",
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
      instructions: buildIdentifyInstructions(req.region),
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
      instructions: buildAssessInstructions(req.taxonomy_hint),
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
    instructions: string;
    request: VisionIdentifyRequest | VisionAssessRequest;
  }): Promise<T> {
    try {
      const image = await resolveImageSource(options.request.image, {
        resolveImage: this.resolveImage,
      });
      const imageUrl =
        image.kind === "url"
          ? image.url
          : `data:${image.mimeType};base64,${image.data}`;
      const response = await this.client.chat.completions.create({
        model: this.meta.model,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: options.instructions,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: JSON.stringify(buildUserContext(options.request)),
              },
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "auto" },
              },
            ],
          },
        ],
      });

      const outputText = response.choices[0]?.message?.content?.trim();
      if (!outputText) {
        throw new Error("empty response from openai provider");
      }
      return JSON.parse(outputText) as T;
    } catch (error) {
      throw mapOpenAIError(error);
    }
  }
}

function buildIdentifyInstructions(region?: string): string {
  return [
    "You are a plant vision classifier. Return a JSON object only, no other text.",
    'Required field: "kind" (one of: "identified", "no_plant", "blurry", "multiple_plants").',
    'When kind is "identified", also include: "image_quality" ("ok" or "blurry"), "detected_plant_count" (integer >= 0), "candidates" (array of up to 4 objects each with "taxonomy_hint" string and "confidence" number 0-1).',
    'Use kind="blurry" when the image is not usable.',
    'Use kind="no_plant" when no plant is visible.',
    'Use kind="multiple_plants" when multiple distinct plants are visible.',
    region ? `User region hint: ${region}.` : undefined,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildAssessInstructions(taxonomyHint?: string): string {
  return [
    "You are a plant health vision assessor. Return a JSON object only, no other text.",
    'Required fields: "signals" (array of objects with "signal" string and "confidence" number 0-1), "overall_confidence" (number 0-1), "image_quality" ("ok" or "blurry"), "detected_plant" (boolean).',
    'Optional field: "raw_notes" (string).',
    'Valid signal values: "slightly_wilted_leaves", "yellowing_tip", "leaf_droop", "new_growth_visible", "stable_appearance", "unknown".',
    "Use only visible evidence from the image.",
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

function mapOpenAIError(error: unknown): Error {
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
