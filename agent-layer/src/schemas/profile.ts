import { z, type RefinementCtx } from "zod";
import { RecognitionStatusEnum, SensitivityEnum } from "./enums.js";

export const CareBaselineSchema = z.object({
  watering_rule: z.string(),
  light_rule: z.string(),
  humidity_rule: z.string().optional(),
  temperature_range: z.string().optional(),
  fertilizing_rule: z.string().optional(),
});
export type CareBaseline = z.infer<typeof CareBaselineSchema>;

export const WeatherLinkFieldsSchema = z.object({
  heat_sensitivity: SensitivityEnum,
  cold_sensitivity: SensitivityEnum,
  humidity_sensitivity: SensitivityEnum,
  light_sensitivity: SensitivityEnum,
});
export type WeatherLinkFields = z.infer<typeof WeatherLinkFieldsSchema>;

export const TaxonomyCandidateSchema = z.object({
  taxonomy_id: z.string(),
  common_name: z.string(),
  scientific_name: z.string().optional(),
  confidence: z.number().min(0).max(1),
});
export type TaxonomyCandidate = z.infer<typeof TaxonomyCandidateSchema>;

export const ProviderMetadataSchema = z.object({
  model: z.string(),
  prompt_version: z.string(),
});
export type ProviderMetadata = z.infer<typeof ProviderMetadataSchema>;

const PlantProfileDraftFieldsSchema = z.object({
  draft_id: z.string(),
  source_image_id: z.string(),
  recognition_status: RecognitionStatusEnum,
  taxonomy_id: z.string().optional(),
  common_name: z.string().optional(),
  scientific_name: z.string().optional(),
  confidence: z.number().min(0).max(1),
  candidates: z.array(TaxonomyCandidateSchema),
  plant_type_tags: z.array(z.string()),
  care_baseline: CareBaselineSchema,
  risk_flags: z.array(z.string()),
  weather_link_fields: WeatherLinkFieldsSchema,
  provider_metadata: ProviderMetadataSchema,
  profile_version: z.string(),
});

export const PlantProfileDraftSchema = PlantProfileDraftFieldsSchema.superRefine(
  (draft: z.infer<typeof PlantProfileDraftFieldsSchema>, ctx: RefinementCtx) => {
    if (draft.recognition_status === "identified" && !draft.taxonomy_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["taxonomy_id"],
        message: "identified drafts must include taxonomy_id",
      });
    }
    if (
      draft.recognition_status === "ambiguous" &&
      draft.candidates.length < 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["candidates"],
        message: "ambiguous drafts must include at least 2 candidates",
      });
    }
    if (draft.recognition_status === "unknown") {
      if (draft.taxonomy_id || draft.scientific_name) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["taxonomy_id"],
          message: "unknown drafts must not carry species fields",
        });
      }
    }
  },
);
export type PlantProfileDraft = z.infer<typeof PlantProfileDraftSchema>;

export const PlantProfileSchema = z.object({
  plant_id: z.string(),
  user_id: z.string(),
  taxonomy_id: z.string(),
  common_name: z.string(),
  scientific_name: z.string().optional(),
  plant_type_tags: z.array(z.string()),
  care_baseline: CareBaselineSchema,
  risk_flags: z.array(z.string()),
  weather_link_fields: WeatherLinkFieldsSchema,
  created_from_draft_id: z.string(),
  profile_version: z.string(),
});
export type PlantProfile = z.infer<typeof PlantProfileSchema>;
