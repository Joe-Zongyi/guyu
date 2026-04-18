import { z } from "zod";
import { StatusEnum } from "./enums.js";
export declare const SuccessEnvelopeSchema: <T extends z.ZodTypeAny>(data: T) => z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: T;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: T;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: T;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const NeedsConfirmationEnvelopeSchema: <T extends z.ZodTypeAny>(data: T) => z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"needs_confirmation">;
    data: T;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"needs_confirmation">;
    data: T;
}>, any> extends infer T_1 ? { [k in keyof T_1]: T_1[k]; } : never, z.baseObjectInputType<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"needs_confirmation">;
    data: T;
}> extends infer T_2 ? { [k_1 in keyof T_2]: T_2[k_1]; } : never>;
export declare const FailureEnvelopeSchema: z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodUnion<[z.ZodLiteral<"failed">, z.ZodLiteral<"needs_retry">]>;
    error_code: z.ZodEnum<["IMAGE_TOO_BLURRY", "NO_PLANT_DETECTED", "MULTIPLE_PLANTS_DETECTED", "LOW_CONFIDENCE_MATCH", "WEATHER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "STATE_ASSESSMENT_UNCERTAIN"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}>;
export type FailureEnvelope = z.infer<typeof FailureEnvelopeSchema>;
export declare const ProfileResponseSchema: z.ZodUnion<[z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"needs_confirmation">;
    data: z.ZodEffects<z.ZodObject<{
        draft_id: z.ZodString;
        source_image_id: z.ZodString;
        recognition_status: z.ZodEnum<["identified", "ambiguous", "unknown"]>;
        taxonomy_id: z.ZodOptional<z.ZodString>;
        common_name: z.ZodOptional<z.ZodString>;
        scientific_name: z.ZodOptional<z.ZodString>;
        confidence: z.ZodNumber;
        candidates: z.ZodArray<z.ZodObject<{
            taxonomy_id: z.ZodString;
            common_name: z.ZodString;
            scientific_name: z.ZodOptional<z.ZodString>;
            confidence: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }, {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }>, "many">;
        plant_type_tags: z.ZodArray<z.ZodString, "many">;
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
        risk_flags: z.ZodArray<z.ZodString, "many">;
        weather_link_fields: z.ZodObject<{
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
        }>;
        provider_metadata: z.ZodObject<{
            model: z.ZodString;
            prompt_version: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            model: string;
            prompt_version: string;
        }, {
            model: string;
            prompt_version: string;
        }>;
        profile_version: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    }, {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    }>, {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    }, {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    status: "needs_confirmation";
    request_id: string;
    data: {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    };
}, {
    status: "needs_confirmation";
    request_id: string;
    data: {
        confidence: number;
        draft_id: string;
        source_image_id: string;
        recognition_status: "identified" | "ambiguous" | "unknown";
        candidates: {
            taxonomy_id: string;
            common_name: string;
            confidence: number;
            scientific_name?: string | undefined;
        }[];
        plant_type_tags: string[];
        care_baseline: {
            watering_rule: string;
            light_rule: string;
            humidity_rule?: string | undefined;
            temperature_range?: string | undefined;
            fertilizing_rule?: string | undefined;
        };
        risk_flags: string[];
        weather_link_fields: {
            heat_sensitivity: "low" | "medium" | "high";
            cold_sensitivity: "low" | "medium" | "high";
            humidity_sensitivity: "low" | "medium" | "high";
            light_sensitivity: "low" | "medium" | "high";
        };
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        profile_version: string;
        taxonomy_id?: string | undefined;
        common_name?: string | undefined;
        scientific_name?: string | undefined;
    };
}>, z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodUnion<[z.ZodLiteral<"failed">, z.ZodLiteral<"needs_retry">]>;
    error_code: z.ZodEnum<["IMAGE_TOO_BLURRY", "NO_PLANT_DETECTED", "MULTIPLE_PLANTS_DETECTED", "LOW_CONFIDENCE_MATCH", "WEATHER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "STATE_ASSESSMENT_UNCERTAIN"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}>]>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export declare const DailyAdviceResponseSchema: z.ZodUnion<[z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: z.ZodObject<{
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
}, "strip", z.ZodTypeAny, {
    status: "success";
    request_id: string;
    data: {
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
    };
}, {
    status: "success";
    request_id: string;
    data: {
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
    };
}>, z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodUnion<[z.ZodLiteral<"failed">, z.ZodLiteral<"needs_retry">]>;
    error_code: z.ZodEnum<["IMAGE_TOO_BLURRY", "NO_PLANT_DETECTED", "MULTIPLE_PLANTS_DETECTED", "LOW_CONFIDENCE_MATCH", "WEATHER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "STATE_ASSESSMENT_UNCERTAIN"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}>]>;
export type DailyAdviceResponse = z.infer<typeof DailyAdviceResponseSchema>;
export declare const StateAssessmentResponseSchema: z.ZodUnion<[z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        overall_state: z.ZodEnum<["stable", "slightly_stressed", "needs_attention"]>;
        signals: z.ZodArray<z.ZodEnum<["slightly_wilted_leaves", "yellowing_tip", "leaf_droop", "new_growth_visible", "stable_appearance", "unknown"]>, "many">;
        confidence: z.ZodNumber;
        suggestions: z.ZodArray<z.ZodString, "many">;
        compare_to_previous: z.ZodEnum<["better", "same", "worse", "unknown"]>;
        escalation_flag: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        confidence: number;
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        suggestions: string[];
        compare_to_previous: "unknown" | "better" | "same" | "worse";
        escalation_flag: boolean;
    }, {
        confidence: number;
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        suggestions: string[];
        compare_to_previous: "unknown" | "better" | "same" | "worse";
        escalation_flag: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    status: "success";
    request_id: string;
    data: {
        confidence: number;
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        suggestions: string[];
        compare_to_previous: "unknown" | "better" | "same" | "worse";
        escalation_flag: boolean;
    };
}, {
    status: "success";
    request_id: string;
    data: {
        confidence: number;
        overall_state: "stable" | "slightly_stressed" | "needs_attention";
        signals: ("unknown" | "slightly_wilted_leaves" | "yellowing_tip" | "leaf_droop" | "new_growth_visible" | "stable_appearance")[];
        suggestions: string[];
        compare_to_previous: "unknown" | "better" | "same" | "worse";
        escalation_flag: boolean;
    };
}>, z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodUnion<[z.ZodLiteral<"failed">, z.ZodLiteral<"needs_retry">]>;
    error_code: z.ZodEnum<["IMAGE_TOO_BLURRY", "NO_PLANT_DETECTED", "MULTIPLE_PLANTS_DETECTED", "LOW_CONFIDENCE_MATCH", "WEATHER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "STATE_ASSESSMENT_UNCERTAIN"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}>]>;
export type StateAssessmentResponse = z.infer<typeof StateAssessmentResponseSchema>;
export declare const PixelArtGenerationResponseSchema: z.ZodUnion<[z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodLiteral<"success">;
    data: z.ZodObject<{
        source_image_id: z.ZodString;
        style: z.ZodLiteral<"pixel_art">;
        images: z.ZodArray<z.ZodObject<{
            file_id: z.ZodString;
            url: z.ZodString;
            content_type: z.ZodOptional<z.ZodString>;
            width: z.ZodOptional<z.ZodNumber>;
            height: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }, {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }>, "many">;
        provider_metadata: z.ZodObject<{
            model: z.ZodString;
            prompt_version: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            model: string;
            prompt_version: string;
        }, {
            model: string;
            prompt_version: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        source_image_id: string;
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        style: "pixel_art";
        images: {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[];
    }, {
        source_image_id: string;
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        style: "pixel_art";
        images: {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[];
    }>;
}, "strip", z.ZodTypeAny, {
    status: "success";
    request_id: string;
    data: {
        source_image_id: string;
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        style: "pixel_art";
        images: {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[];
    };
}, {
    status: "success";
    request_id: string;
    data: {
        source_image_id: string;
        provider_metadata: {
            model: string;
            prompt_version: string;
        };
        style: "pixel_art";
        images: {
            file_id: string;
            url: string;
            content_type?: string | undefined;
            width?: number | undefined;
            height?: number | undefined;
        }[];
    };
}>, z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodUnion<[z.ZodLiteral<"failed">, z.ZodLiteral<"needs_retry">]>;
    error_code: z.ZodEnum<["IMAGE_TOO_BLURRY", "NO_PLANT_DETECTED", "MULTIPLE_PLANTS_DETECTED", "LOW_CONFIDENCE_MATCH", "WEATHER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_UNAVAILABLE", "STATE_ASSESSMENT_UNCERTAIN"]>;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}, {
    message: string;
    status: "needs_retry" | "failed";
    request_id: string;
    error_code: "IMAGE_TOO_BLURRY" | "NO_PLANT_DETECTED" | "MULTIPLE_PLANTS_DETECTED" | "LOW_CONFIDENCE_MATCH" | "WEATHER_UNAVAILABLE" | "PROVIDER_TIMEOUT" | "PROVIDER_UNAVAILABLE" | "STATE_ASSESSMENT_UNCERTAIN";
}>]>;
export type PixelArtGenerationResponse = z.infer<typeof PixelArtGenerationResponseSchema>;
export { StatusEnum };
//# sourceMappingURL=envelopes.d.ts.map