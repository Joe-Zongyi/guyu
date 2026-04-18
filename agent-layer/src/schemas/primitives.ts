import { z } from "zod";
import {
  CareEventTypeEnum,
  LightLevelEnum,
  WeatherConditionEnum,
} from "./enums.js";

export const Iso8601 = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/,
    "must be ISO 8601 datetime",
  );

export const IsoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "must be ISO 8601 date (YYYY-MM-DD)");

export const FileRefSchema = z.object({
  file_id: z.string().min(1),
  url: z.string().url().optional(),
  content_type: z.string().min(1).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  captured_at: Iso8601.optional(),
});
export type FileRef = z.infer<typeof FileRefSchema>;

export const WeatherSnapshotSchema = z.object({
  date: IsoDate.optional(),
  location: z.string().optional(),
  condition: WeatherConditionEnum,
  temperature_c: z.number(),
  humidity: z.number().min(0).max(100),
  light_level: LightLevelEnum,
  source: z.string().optional(),
});
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;

export const CareEventSchema = z.object({
  event_id: z.string().optional(),
  plant_id: z.string().optional(),
  type: CareEventTypeEnum,
  occurred_at: Iso8601,
  metadata: z.record(z.unknown()).optional(),
});
export type CareEvent = z.infer<typeof CareEventSchema>;
