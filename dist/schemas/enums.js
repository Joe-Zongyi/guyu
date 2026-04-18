import { z } from "zod";
export const StatusEnum = z.enum([
    "success",
    "needs_retry",
    "needs_confirmation",
    "failed",
]);
export const ErrorCodeEnum = z.enum([
    "IMAGE_TOO_BLURRY",
    "NO_PLANT_DETECTED",
    "MULTIPLE_PLANTS_DETECTED",
    "LOW_CONFIDENCE_MATCH",
    "WEATHER_UNAVAILABLE",
    "PROVIDER_TIMEOUT",
    "PROVIDER_UNAVAILABLE",
    "STATE_ASSESSMENT_UNCERTAIN",
]);
export const RecognitionStatusEnum = z.enum([
    "identified",
    "ambiguous",
    "unknown",
]);
export const OverallStateEnum = z.enum([
    "stable",
    "slightly_stressed",
    "needs_attention",
]);
export const StateSignalEnum = z.enum([
    "slightly_wilted_leaves",
    "yellowing_tip",
    "leaf_droop",
    "new_growth_visible",
    "stable_appearance",
    "unknown",
]);
export const CompareToPreviousEnum = z.enum([
    "better",
    "same",
    "worse",
    "unknown",
]);
export const ActionPriorityEnum = z.enum(["low", "medium", "high"]);
export const SuggestedTimeEnum = z.enum([
    "morning",
    "midday",
    "evening",
    "any",
]);
export const SeasonEnum = z.enum(["spring", "summer", "autumn", "winter"]);
export const SensitivityEnum = z.enum(["low", "medium", "high"]);
export const PressureEnum = z.enum(["low", "medium", "high"]);
export const WeatherConditionEnum = z.enum([
    "sunny",
    "cloudy",
    "overcast",
    "rain",
    "snow",
    "fog",
    "windy",
    "unknown",
]);
export const LightLevelEnum = z.enum(["low", "medium", "high"]);
export const CareEventTypeEnum = z.enum([
    "watered",
    "fertilized",
    "repotted",
    "pruned",
    "moved",
    "other",
]);
export const ActionTypeEnum = z.enum([
    "water_now",
    "water_check",
    "skip_water",
    "move_to_shade",
    "move_to_light",
    "increase_humidity",
    "ventilate",
    "fertilize",
    "observe",
]);
//# sourceMappingURL=enums.js.map