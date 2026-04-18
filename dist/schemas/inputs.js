import { z } from "zod";
import { CareBaselineSchema, WeatherLinkFieldsSchema } from "./profile.js";
import { CareEventSchema, FileRefSchema, IsoDate } from "./primitives.js";
import { LightLevelEnum, SeasonEnum, WeatherConditionEnum } from "./enums.js";
import { RecentAssessmentSchema } from "./assessment.js";
export const AnalyzeProfileInputSchema = z.object({
    user_id: z.string().min(1),
    image: FileRefSchema,
    region: z.string().optional(),
    request_id: z.string().min(1),
});
const InlineProfileForAdviceSchema = z.object({
    taxonomy_id: z.string(),
    common_name: z.string(),
    scientific_name: z.string().optional(),
    plant_type_tags: z.array(z.string()).optional(),
    care_baseline: CareBaselineSchema,
    risk_flags: z.array(z.string()).default([]),
    weather_link_fields: WeatherLinkFieldsSchema.optional(),
});
const PartialWeatherSnapshotSchema = z.object({
    date: IsoDate.optional(),
    location: z.string().optional(),
    condition: WeatherConditionEnum.optional(),
    temperature_c: z.number().optional(),
    humidity: z.number().min(0).max(100).optional(),
    light_level: LightLevelEnum.optional(),
    source: z.string().optional(),
});
export const TodayContextSchema = z.object({
    date: IsoDate,
    season: SeasonEnum.optional(),
    weather_snapshot: PartialWeatherSnapshotSchema.optional(),
    recent_care_events: z.array(CareEventSchema).default([]),
});
export const GenerateDailyAdviceInputSchema = z.object({
    plant_id: z.string().min(1),
    profile: InlineProfileForAdviceSchema,
    today_context: TodayContextSchema,
    request_id: z.string().min(1),
});
const InlineProfileForAssessmentSchema = z.object({
    taxonomy_id: z.string(),
    common_name: z.string(),
});
export const AssessStateInputSchema = z.object({
    plant_id: z.string().min(1),
    image: FileRefSchema,
    profile: InlineProfileForAssessmentSchema,
    recent_assessments: z.array(RecentAssessmentSchema).default([]),
    request_id: z.string().min(1),
});
export const GeneratePixelArtInputSchema = z.object({
    image: FileRefSchema,
    style_references: z.array(FileRefSchema).default([]),
    prompt: z.string().min(1).optional(),
    variants: z.number().int().min(1).max(4).default(1),
    request_id: z.string().min(1),
});
//# sourceMappingURL=inputs.js.map