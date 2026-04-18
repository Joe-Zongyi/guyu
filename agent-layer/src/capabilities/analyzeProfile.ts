import {
  AnalyzeProfileInputSchema,
  type AnalyzeProfileInput,
} from "../schemas/inputs.js";
import type { ZodIssue } from "zod";
import type { ProfileResponse } from "../schemas/envelopes.js";
import type {
  PlantProfileDraft,
  TaxonomyCandidate,
} from "../schemas/profile.js";
import type {
  VisionIdentifyOutcome,
  VisionProvider,
} from "../providers/types.js";
import { isProviderError } from "../providers/types.js";
import {
  getTaxonomyById,
  resolveTaxonomy,
  type TaxonomyEntry,
} from "../taxonomy/catalog.js";
import { newId } from "../util/id.js";

export interface AnalyzeProfileDeps {
  visionProvider: VisionProvider;
  thresholds?: {
    identifiedMin?: number;
    ambiguousMin?: number;
  };
  generateDraftId?: () => string;
}

const DEFAULT_THRESHOLDS = {
  identifiedMin: 0.75,
  ambiguousMin: 0.4,
};

const PROFILE_VERSION = "v1";

function toCandidate(
  entry: TaxonomyEntry,
  confidence: number,
): TaxonomyCandidate {
  return {
    taxonomy_id: entry.taxonomy_id,
    common_name: entry.common_name,
    scientific_name: entry.scientific_name,
    confidence: round2(confidence),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildDraftFromOutcome(
  outcome: Extract<VisionIdentifyOutcome, { kind: "identified" }>,
  deps: Required<Pick<AnalyzeProfileDeps, "visionProvider">> &
    AnalyzeProfileDeps,
  input: AnalyzeProfileInput,
): PlantProfileDraft | { kind: "low_confidence" } {
  const thresholds = {
    ...DEFAULT_THRESHOLDS,
    ...(deps.thresholds ?? {}),
  };

  const ranked = outcome.candidates
    .map((c) => ({
      entry: resolveTaxonomy(c.taxonomy_hint),
      confidence: c.confidence,
    }))
    .filter(
      (c): c is { entry: TaxonomyEntry; confidence: number } =>
        c.entry !== undefined,
    )
    .sort((a, b) => b.confidence - a.confidence);

  const draftId = (deps.generateDraftId ?? (() => newId("draft")))();
  const meta = deps.visionProvider.metadata();
  const providerMetadata = {
    model: meta.model,
    prompt_version: meta.identify_prompt_version,
  };

  if (ranked.length === 0) {
    return {
      draft_id: draftId,
      source_image_id: input.image.file_id,
      recognition_status: "unknown",
      confidence: 0,
      candidates: [],
      plant_type_tags: [],
      care_baseline: GENERIC_CARE_BASELINE,
      risk_flags: [],
      weather_link_fields: GENERIC_WEATHER_LINK,
      provider_metadata: providerMetadata,
      profile_version: PROFILE_VERSION,
    };
  }

  const top = ranked[0]!;

  if (top.confidence >= thresholds.identifiedMin) {
    return {
      draft_id: draftId,
      source_image_id: input.image.file_id,
      recognition_status: "identified",
      taxonomy_id: top.entry.taxonomy_id,
      common_name: top.entry.common_name,
      scientific_name: top.entry.scientific_name,
      confidence: round2(top.confidence),
      candidates: ranked
        .slice(1, 4)
        .map((c) => toCandidate(c.entry, c.confidence)),
      plant_type_tags: [...top.entry.plant_type_tags],
      care_baseline: top.entry.care_baseline,
      risk_flags: [...top.entry.risk_flags],
      weather_link_fields: top.entry.weather_link_fields,
      provider_metadata: providerMetadata,
      profile_version: PROFILE_VERSION,
    };
  }

  if (top.confidence >= thresholds.ambiguousMin) {
    const candidates = ranked
      .slice(0, 4)
      .map((c) => toCandidate(c.entry, c.confidence));
    if (candidates.length < 2) {
      return { kind: "low_confidence" };
    }
    return {
      draft_id: draftId,
      source_image_id: input.image.file_id,
      recognition_status: "ambiguous",
      confidence: round2(top.confidence),
      candidates,
      plant_type_tags: [...top.entry.plant_type_tags],
      care_baseline: top.entry.care_baseline,
      risk_flags: [...top.entry.risk_flags],
      weather_link_fields: top.entry.weather_link_fields,
      provider_metadata: providerMetadata,
      profile_version: PROFILE_VERSION,
    };
  }

  return { kind: "low_confidence" };
}

const GENERIC_CARE_BASELINE = {
  watering_rule: "暂未识别植物，建议土表干后浇透",
  light_rule: "暂未识别植物，建议先放在明亮散射光位置",
  humidity_rule: "保持环境通风、湿度适中",
  temperature_range: "15-28C",
  fertilizing_rule: "未识别前不建议追肥",
};

const GENERIC_WEATHER_LINK = {
  heat_sensitivity: "medium" as const,
  cold_sensitivity: "medium" as const,
  humidity_sensitivity: "medium" as const,
  light_sensitivity: "medium" as const,
};

export async function analyzeProfile(
  rawInput: unknown,
  deps: AnalyzeProfileDeps,
): Promise<ProfileResponse> {
  const parsed = AnalyzeProfileInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      status: "failed",
      error_code: "NO_PLANT_DETECTED",
      message: `invalid input: ${parsed.error.issues
        .map((i: ZodIssue) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
      request_id:
        (rawInput as { request_id?: string })?.request_id ?? "unknown",
    };
  }
  const input = parsed.data;

  let outcome: VisionIdentifyOutcome;
  try {
    outcome = await deps.visionProvider.identifyPlant({
      image: input.image,
      request_id: input.request_id,
      ...(input.region !== undefined ? { region: input.region } : {}),
    });
  } catch (err) {
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
      message: `provider error: ${(err as Error).message ?? "unknown"}`,
      request_id: input.request_id,
    };
  }

  switch (outcome.kind) {
    case "blurry":
      return {
        status: "failed",
        error_code: "IMAGE_TOO_BLURRY",
        message: "图片清晰度不足，请重新拍摄",
        request_id: input.request_id,
      };
    case "no_plant":
      return {
        status: "failed",
        error_code: "NO_PLANT_DETECTED",
        message: "未在图片中检测到植物，请重新拍摄",
        request_id: input.request_id,
      };
    case "multiple_plants":
      return {
        status: "failed",
        error_code: "MULTIPLE_PLANTS_DETECTED",
        message: "检测到多株植物，请单独拍摄一株",
        request_id: input.request_id,
      };
    case "identified": {
      if (outcome.image_quality === "blurry") {
        return {
          status: "failed",
          error_code: "IMAGE_TOO_BLURRY",
          message: "图片清晰度不足，请重新拍摄",
          request_id: input.request_id,
        };
      }
      if (outcome.detected_plant_count > 1) {
        return {
          status: "failed",
          error_code: "MULTIPLE_PLANTS_DETECTED",
          message: "检测到多株植物，请单独拍摄一株",
          request_id: input.request_id,
        };
      }

      const built = buildDraftFromOutcome(outcome, deps, input);
      if ("kind" in built && built.kind === "low_confidence") {
        return {
          status: "failed",
          error_code: "LOW_CONFIDENCE_MATCH",
          message: "识别置信度过低，请重新拍摄或补充信息",
          request_id: input.request_id,
        };
      }

      return {
        status: "needs_confirmation",
        data: built as PlantProfileDraft,
        request_id: input.request_id,
      };
    }
  }
}

export { getTaxonomyById };
