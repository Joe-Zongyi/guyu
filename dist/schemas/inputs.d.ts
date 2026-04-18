import { z } from "zod";
export declare const AnalyzeProfileInputSchema: z.ZodObject<{
    user_id: z.ZodString;
    image: z.ZodObject<{
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
    region: z.ZodOptional<z.ZodString>;
    request_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    region?: string | undefined;
}, {
    user_id: string;
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    region?: string | undefined;
}>;
export type AnalyzeProfileInput = z.infer<typeof AnalyzeProfileInputSchema>;
export declare const TodayContextSchema: z.ZodObject<{
    date: z.ZodString;
    season: z.ZodOptional<z.ZodEnum<["spring", "summer", "autumn", "winter"]>>;
    weather_snapshot: z.ZodOptional<z.ZodObject<{
        date: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        condition: z.ZodOptional<z.ZodEnum<["sunny", "cloudy", "overcast", "rain", "snow", "fog", "windy", "unknown"]>>;
        temperature_c: z.ZodOptional<z.ZodNumber>;
        humidity: z.ZodOptional<z.ZodNumber>;
        light_level: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
        source: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        date?: string | undefined;
        location?: string | undefined;
        condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
        temperature_c?: number | undefined;
        humidity?: number | undefined;
        light_level?: "low" | "medium" | "high" | undefined;
        source?: string | undefined;
    }, {
        date?: string | undefined;
        location?: string | undefined;
        condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
        temperature_c?: number | undefined;
        humidity?: number | undefined;
        light_level?: "low" | "medium" | "high" | undefined;
        source?: string | undefined;
    }>>;
    recent_care_events: z.ZodDefault<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    date: string;
    recent_care_events: {
        type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
        occurred_at: string;
        plant_id?: string | undefined;
        event_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[];
    season?: "spring" | "summer" | "autumn" | "winter" | undefined;
    weather_snapshot?: {
        date?: string | undefined;
        location?: string | undefined;
        condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
        temperature_c?: number | undefined;
        humidity?: number | undefined;
        light_level?: "low" | "medium" | "high" | undefined;
        source?: string | undefined;
    } | undefined;
}, {
    date: string;
    season?: "spring" | "summer" | "autumn" | "winter" | undefined;
    weather_snapshot?: {
        date?: string | undefined;
        location?: string | undefined;
        condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
        temperature_c?: number | undefined;
        humidity?: number | undefined;
        light_level?: "low" | "medium" | "high" | undefined;
        source?: string | undefined;
    } | undefined;
    recent_care_events?: {
        type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
        occurred_at: string;
        plant_id?: string | undefined;
        event_id?: string | undefined;
        metadata?: Record<string, unknown> | undefined;
    }[] | undefined;
}>;
export type TodayContext = z.infer<typeof TodayContextSchema>;
export declare const GenerateDailyAdviceInputSchema: z.ZodObject<{
    plant_id: z.ZodString;
    profile: z.ZodObject<{
        taxonomy_id: z.ZodString;
        common_name: z.ZodString;
        scientific_name: z.ZodOptional<z.ZodString>;
        plant_type_tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        care_baseline: z.ZodObject<{
            watering_rule: z.ZodString;
            light_rule: z.ZodString;
            humidity_rule: z.ZodOptional<z.ZodString>;
            temperature_range: z.ZodOptional<z.ZodString>;
            fertilizing_rule: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        }, {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        }>;
        risk_flags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        weather_link_fields: z.ZodOptional<z.ZodObject<{
            heat_sensitivity: z.ZodEnum<["low", "medium", "high"]>;
            cold_sensitivity: z.ZodEnum<["low", "medium", "high"]>;
            humidity_sensitivity: z.ZodEnum<["low", "medium", "high"]>;
            light_sensitivity: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        }, {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        }>>;
    }, "strip", z.ZodTypeAny, {
        taxonomy_id: string;
        common_name: string;
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        scientific_name?: string | undefined;
        plant_type_tags?: string[] | undefined;
        weather_link_fields?: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        } | undefined;
    }, {
        taxonomy_id: string;
        common_name: string;
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        scientific_name?: string | undefined;
        plant_type_tags?: string[] | undefined;
        risk_flags?: string[] | undefined;
        weather_link_fields?: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        } | undefined;
    }>;
    today_context: z.ZodObject<{
        date: z.ZodString;
        season: z.ZodOptional<z.ZodEnum<["spring", "summer", "autumn", "winter"]>>;
        weather_snapshot: z.ZodOptional<z.ZodObject<{
            date: z.ZodOptional<z.ZodString>;
            location: z.ZodOptional<z.ZodString>;
            condition: z.ZodOptional<z.ZodEnum<["sunny", "cloudy", "overcast", "rain", "snow", "fog", "windy", "unknown"]>>;
            temperature_c: z.ZodOptional<z.ZodNumber>;
            humidity: z.ZodOptional<z.ZodNumber>;
            light_level: z.ZodOptional<z.ZodEnum<["low", "medium", "high"]>>;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        }, {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        }>>;
        recent_care_events: z.ZodDefault<z.ZodArray<z.ZodObject<{
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
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        date: string;
        recent_care_events: {
            type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
            occurred_at: string;
            plant_id?: string | undefined;
            event_id?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        season?: "spring" | "summer" | "autumn" | "winter" | undefined;
        weather_snapshot?: {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        } | undefined;
    }, {
        date: string;
        season?: "spring" | "summer" | "autumn" | "winter" | undefined;
        weather_snapshot?: {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        } | undefined;
        recent_care_events?: {
            type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
            occurred_at: string;
            plant_id?: string | undefined;
            event_id?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[] | undefined;
    }>;
    request_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    plant_id: string;
    request_id: string;
    profile: {
        taxonomy_id: string;
        common_name: string;
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        scientific_name?: string | undefined;
        plant_type_tags?: string[] | undefined;
        weather_link_fields?: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        } | undefined;
    };
    today_context: {
        date: string;
        recent_care_events: {
            type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
            occurred_at: string;
            plant_id?: string | undefined;
            event_id?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[];
        season?: "spring" | "summer" | "autumn" | "winter" | undefined;
        weather_snapshot?: {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        } | undefined;
    };
}, {
    plant_id: string;
    request_id: string;
    profile: {
        taxonomy_id: string;
        common_name: string;
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        scientific_name?: string | undefined;
        plant_type_tags?: string[] | undefined;
        risk_flags?: string[] | undefined;
        weather_link_fields?: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        } | undefined;
    };
    today_context: {
        date: string;
        season?: "spring" | "summer" | "autumn" | "winter" | undefined;
        weather_snapshot?: {
            date?: string | undefined;
            location?: string | undefined;
            condition?: "unknown" | "sunny" | "cloudy" | "overcast" | "rain" | "snow" | "fog" | "windy" | undefined;
            temperature_c?: number | undefined;
            humidity?: number | undefined;
            light_level?: "low" | "medium" | "high" | undefined;
            source?: string | undefined;
        } | undefined;
        recent_care_events?: {
            type: "watered" | "fertilized" | "repotted" | "pruned" | "moved" | "other";
            occurred_at: string;
            plant_id?: string | undefined;
            event_id?: string | undefined;
            metadata?: Record<string, unknown> | undefined;
        }[] | undefined;
    };
}>;
export type GenerateDailyAdviceInput = z.infer<typeof GenerateDailyAdviceInputSchema>;
export declare const AssessStateInputSchema: z.ZodObject<{
    plant_id: z.ZodString;
    image: z.ZodObject<{
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
    profile: z.ZodObject<{
        taxonomy_id: z.ZodString;
        common_name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taxonomy_id: string;
        common_name: string;
    }, {
        taxonomy_id: string;
        common_name: string;
    }>;
    recent_assessments: z.ZodDefault<z.ZodArray<z.ZodObject<{
        overall_state: z.ZodEnum<["stable", "slightly_stressed", "needs_attention"]>;
        signals: z.ZodArray<z.ZodEnum<["slightly_wilted_leaves", "yellowing_tip", "leaf_droop", "new_growth_visible", "stable_appearance", "unknown"]>, "many">;
        assessed_at: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        assessed_at: string;
    }, {
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        assessed_at: string;
    }>, "many">>;
    request_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    plant_id: string;
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    profile: {
        taxonomy_id: string;
        common_name: string;
    };
    recent_assessments: {
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        assessed_at: string;
    }[];
}, {
    plant_id: string;
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    profile: {
        taxonomy_id: string;
        common_name: string;
    };
    recent_assessments?: {
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        assessed_at: string;
    }[] | undefined;
}>;
export type AssessStateInput = z.infer<typeof AssessStateInputSchema>;
export declare const GeneratePixelArtInputSchema: z.ZodObject<{
    image: z.ZodObject<{
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
    style_references: z.ZodDefault<z.ZodArray<z.ZodObject<{
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
    }>, "many">>;
    prompt: z.ZodOptional<z.ZodString>;
    variants: z.ZodDefault<z.ZodNumber>;
    request_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    style_references: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    }[];
    variants: number;
    prompt?: string | undefined;
}, {
    image: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    };
    request_id: string;
    style_references?: {
        file_id: string;
        url?: string | undefined;
        content_type?: string | undefined;
        width?: number | undefined;
        height?: number | undefined;
        captured_at?: string | undefined;
    }[] | undefined;
    prompt?: string | undefined;
    variants?: number | undefined;
}>;
export type GeneratePixelArtInput = z.infer<typeof GeneratePixelArtInputSchema>;
//# sourceMappingURL=inputs.d.ts.map