import { z } from "zod";
export declare const ActionSchema: z.ZodObject<{
    type: z.ZodEnum<["water_now", "water_check", "skip_water", "move_to_shade", "move_to_light", "increase_humidity", "ventilate", "fertilize", "observe"]>;
    priority: z.ZodEnum<["low", "medium", "high"]>;
    reason: z.ZodString;
    suggested_time: z.ZodEnum<["morning", "midday", "evening", "any"]>;
}, "strip", z.ZodTypeAny, {
    type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
    priority: "low" | "medium" | "high";
    reason: string;
    suggested_time: "morning" | "midday" | "evening" | "any";
}, {
    type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
    priority: "low" | "medium" | "high";
    reason: string;
    suggested_time: "morning" | "midday" | "evening" | "any";
}>;
export type Action = z.infer<typeof ActionSchema>;
export declare const DerivedContextSchema: z.ZodObject<{
    watering_pressure: z.ZodEnum<["low", "medium", "high"]>;
    light_pressure: z.ZodEnum<["low", "medium", "high"]>;
    temperature_risk: z.ZodEnum<["low", "medium", "high"]>;
}, "strip", z.ZodTypeAny, {
    watering_pressure: "low" | "medium" | "high";
    light_pressure: "low" | "medium" | "high";
    temperature_risk: "low" | "medium" | "high";
}, {
    watering_pressure: "low" | "medium" | "high";
    light_pressure: "low" | "medium" | "high";
    temperature_risk: "low" | "medium" | "high";
}>;
export type DerivedContext = z.infer<typeof DerivedContextSchema>;
export declare const DailyAdviceSchema: z.ZodObject<{
    date: z.ZodString;
    actions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["water_now", "water_check", "skip_water", "move_to_shade", "move_to_light", "increase_humidity", "ventilate", "fertilize", "observe"]>;
        priority: z.ZodEnum<["low", "medium", "high"]>;
        reason: z.ZodString;
        suggested_time: z.ZodEnum<["morning", "midday", "evening", "any"]>;
    }, "strip", z.ZodTypeAny, {
        type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
        priority: "low" | "medium" | "high";
        reason: string;
        suggested_time: "morning" | "midday" | "evening" | "any";
    }, {
        type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
        priority: "low" | "medium" | "high";
        reason: string;
        suggested_time: "morning" | "midday" | "evening" | "any";
    }>, "many">;
    warnings: z.ZodArray<z.ZodString, "many">;
    today_summary: z.ZodString;
    mood_copy: z.ZodString;
    derived_context: z.ZodObject<{
        watering_pressure: z.ZodEnum<["low", "medium", "high"]>;
        light_pressure: z.ZodEnum<["low", "medium", "high"]>;
        temperature_risk: z.ZodEnum<["low", "medium", "high"]>;
    }, "strip", z.ZodTypeAny, {
        watering_pressure: "low" | "medium" | "high";
        light_pressure: "low" | "medium" | "high";
        temperature_risk: "low" | "medium" | "high";
    }, {
        watering_pressure: "low" | "medium" | "high";
        light_pressure: "low" | "medium" | "high";
        temperature_risk: "low" | "medium" | "high";
    }>;
}, "strip", z.ZodTypeAny, {
    date: string;
    actions: {
        type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
        priority: "low" | "medium" | "high";
        reason: string;
        suggested_time: "morning" | "midday" | "evening" | "any";
    }[];
    warnings: string[];
    today_summary: string;
    mood_copy: string;
    derived_context: {
        watering_pressure: "low" | "medium" | "high";
        light_pressure: "low" | "medium" | "high";
        temperature_risk: "low" | "medium" | "high";
    };
}, {
    date: string;
    actions: {
        type: "water_now" | "water_check" | "skip_water" | "move_to_shade" | "move_to_light" | "increase_humidity" | "ventilate" | "fertilize" | "observe";
        priority: "low" | "medium" | "high";
        reason: string;
        suggested_time: "morning" | "midday" | "evening" | "any";
    }[];
    warnings: string[];
    today_summary: string;
    mood_copy: string;
    derived_context: {
        watering_pressure: "low" | "medium" | "high";
        light_pressure: "low" | "medium" | "high";
        temperature_risk: "low" | "medium" | "high";
    };
}>;
export type DailyAdvice = z.infer<typeof DailyAdviceSchema>;
//# sourceMappingURL=advice.d.ts.map