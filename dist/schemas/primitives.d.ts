import { z } from "zod";
export declare const Iso8601: z.ZodString;
export declare const IsoDate: z.ZodString;
export declare const FileRefSchema: z.ZodObject<{
    file_id: z.ZodString;
    url: z.ZodOptional<z.ZodString>;
    content_type: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    captured_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    file_id: string;
    url?: string | undefined;
    content_type?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    captured_at?: string | undefined;
}, {
    file_id: string;
    url?: string | undefined;
    content_type?: string | undefined;
    width?: number | undefined;
    height?: number | undefined;
    captured_at?: string | undefined;
}>;
export type FileRef = z.infer<typeof FileRefSchema>;
export declare const WeatherSnapshotSchema: z.ZodObject<{
    date: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    condition: z.ZodEnum<["sunny", "cloudy", "overcast", "rain", "snow", "fog", "windy", "unknown"]>;
    temperature_c: z.ZodNumber;
    humidity: z.ZodNumber;
    light_level: z.ZodEnum<["low", "medium", "high"]>;
    source: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    condition: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy";
    temperature_c: number;
    humidity: number;
    light_level: "low" | "medium" | "high";
    date?: string | undefined;
    location?: string | undefined;
    source?: string | undefined;
}, {
    condition: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy";
    temperature_c: number;
    humidity: number;
    light_level: "low" | "medium" | "high";
    date?: string | undefined;
    location?: string | undefined;
    source?: string | undefined;
}>;
export type WeatherSnapshot = z.infer<typeof WeatherSnapshotSchema>;
export declare const CareEventSchema: z.ZodObject<{
    event_id: z.ZodOptional<z.ZodString>;
    plant_id: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<["watered", "fertilized", "repotted", "pruned", "moved", "other"]>;
    occurred_at: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
    occurred_at: string;
    plant_id?: string | undefined;
    event_id?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}, {
    type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
    occurred_at: string;
    plant_id?: string | undefined;
    event_id?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
}>;
export type CareEvent = z.infer<typeof CareEventSchema>;
//# sourceMappingURL=primitives.d.ts.map