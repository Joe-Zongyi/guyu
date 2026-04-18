import { z } from "zod";
import {
  ActionPriorityEnum,
  ActionTypeEnum,
  PressureEnum,
  SuggestedTimeEnum,
} from "./enums.js";
import { IsoDate } from "./primitives.js";

export const ActionSchema = z.object({
  type: ActionTypeEnum,
  priority: ActionPriorityEnum,
  reason: z.string(),
  suggested_time: SuggestedTimeEnum,
});
export type Action = z.infer<typeof ActionSchema>;

export const DerivedContextSchema = z.object({
  watering_pressure: PressureEnum,
  light_pressure: PressureEnum,
  temperature_risk: PressureEnum,
});
export type DerivedContext = z.infer<typeof DerivedContextSchema>;

export const DailyAdviceSchema = z.object({
  date: IsoDate,
  actions: z.array(ActionSchema),
  warnings: z.array(z.string()),
  today_summary: z.string(),
  mood_copy: z.string(),
  derived_context: DerivedContextSchema,
});
export type DailyAdvice = z.infer<typeof DailyAdviceSchema>;
