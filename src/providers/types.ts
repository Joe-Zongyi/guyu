import type { FileRef } from "../schemas/primitives.js";
import type { StateSignal } from "../schemas/enums.js";

export interface VisionIdentifyRequest {
  image: FileRef;
  request_id: string;
  region?: string;
}

export interface VisionIdentifyCandidate {
  taxonomy_hint: string;
  confidence: number;
}

export type VisionIdentifyOutcome =
  | {
      kind: "identified";
      candidates: VisionIdentifyCandidate[];
      image_quality: "ok" | "blurry";
      detected_plant_count: number;
    }
  | {
      kind: "no_plant";
    }
  | {
      kind: "blurry";
    }
  | {
      kind: "multiple_plants";
    };

export interface VisionAssessRequest {
  image: FileRef;
  request_id: string;
  taxonomy_hint?: string;
}

export interface VisionAssessOutcome {
  signals: Array<{ signal: StateSignal; confidence: number }>;
  overall_confidence: number;
  image_quality: "ok" | "blurry";
  detected_plant: boolean;
  raw_notes?: string;
}

export interface ProviderTimeoutError extends Error {
  code: "PROVIDER_TIMEOUT";
}

export interface ProviderUnavailableError extends Error {
  code: "PROVIDER_UNAVAILABLE";
}

export type ProviderError = ProviderTimeoutError | ProviderUnavailableError;

export function isProviderError(err: unknown): err is ProviderError {
  return (
    err instanceof Error &&
    "code" in err &&
    (err.code === "PROVIDER_TIMEOUT" || err.code === "PROVIDER_UNAVAILABLE")
  );
}

export function makeProviderError(
  code: "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE",
  message: string,
): ProviderError {
  const err = new Error(message) as ProviderError;
  (err as { code: string }).code = code;
  return err;
}

export interface VisionProviderMetadata {
  model: string;
  identify_prompt_version: string;
  assess_prompt_version: string;
}

export interface VisionProvider {
  metadata(): VisionProviderMetadata;
  identifyPlant(req: VisionIdentifyRequest): Promise<VisionIdentifyOutcome>;
  assessPlantState(req: VisionAssessRequest): Promise<VisionAssessOutcome>;
}
