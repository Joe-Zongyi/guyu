import { z } from "zod";

export const StatusEnum = z.enum([
  "success",
  "needs_retry",
  "needs_confirmation",
  "failed",
]);
export type Status = z.infer<typeof StatusEnum>;

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
export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

export const RecognitionStatusEnum = z.enum([
  "identified",
  "ambiguous",
  "unknown",
]);
export type RecognitionStatus = z.infer<typeof RecognitionStatusEnum>;

export const OverallStateEnum = z.enum([
  "stable",
  "slightly_stressed",
  "needs_attention",
]);
export type OverallState = z.infer<typeof OverallStateEnum>;

export const StateSignalEnum = z.enum([
  "slightly_wilted_leaves",
  "yellowing_tip",
  "leaf_droop",
  "new_growth_visible",
  "stable_appearance",
  "unknown",
]);
export type StateSignal = z.infer<typeof StateSignalEnum>;

export const CompareToPreviousEnum = z.enum([
  "better",
  "same",
  "worse",
  "unknown",
]);
export type CompareToPrevious = z.infer<typeof CompareToPreviousEnum>;

export const ActionPriorityEnum = z.enum(["low", "medium", "high"]);
export type ActionPriority = z.infer<typeof ActionPriorityEnum>;

export const SuggestedTimeEnum = z.enum([
  "morning",
  "midday",
  "evening",
  "any",
]);
export type SuggestedTime = z.infer<typeof SuggestedTimeEnum>;

export const SeasonEnum = z.enum(["spring", "summer", "autumn", "winter"]);
export type Season = z.infer<typeof SeasonEnum>;

export const SensitivityEnum = z.enum(["low", "medium", "high"]);
export type Sensitivity = z.infer<typeof SensitivityEnum>;

export const PressureEnum = z.enum(["low", "medium", "high"]);
export type Pressure = z.infer<typeof PressureEnum>;

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
export type WeatherCondition = z.infer<typeof WeatherConditionEnum>;

export const LightLevelEnum = z.enum(["low", "medium", "high"]);
export type LightLevel = z.infer<typeof LightLevelEnum>;

export const CareEventTypeEnum = z.enum([
  "watered",
  "fertilized",
  "repotted",
  "pruned",
  "moved",
  "other",
]);
export type CareEventType = z.infer<typeof CareEventTypeEnum>;

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
export type ActionType = z.infer<typeof ActionTypeEnum>;
