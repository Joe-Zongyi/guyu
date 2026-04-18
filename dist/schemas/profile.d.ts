import { z } from "zod";
export declare const CareBaselineSchema: z.ZodObject<{
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
export type CareBaseline = z.infer<typeof CareBaselineSchema>;
export declare const WeatherLinkFieldsSchema: z.ZodObject<{
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
export type WeatherLinkFields = z.infer<typeof WeatherLinkFieldsSchema>;
export declare const TaxonomyCandidateSchema: z.ZodObject<{
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
}>;
export type TaxonomyCandidate = z.infer<typeof TaxonomyCandidateSchema>;
export declare const ProviderMetadataSchema: z.ZodObject<{
    model: z.ZodString;
    prompt_version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    model: string;
    prompt_version: string;
}, {
    model: string;
    prompt_version: string;
}>;
export type ProviderMetadata = z.infer<typeof ProviderMetadataSchema>;
export declare const PlantProfileDraftSchema: z.ZodEffects<z.ZodObject<{
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
export type PlantProfileDraft = z.infer<typeof PlantProfileDraftSchema>;
export declare const PlantProfileSchema: z.ZodObject<{
    plant_id: z.ZodString;
    user_id: z.ZodString;
    taxonomy_id: z.ZodString;
    common_name: z.ZodString;
    scientific_name: z.ZodOptional<z.ZodString>;
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
    created_from_draft_id: z.ZodString;
    profile_version: z.ZodString;
}, "strip", z.ZodTypeAny, {
    taxonomy_id: string;
    common_name: string;
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
    profile_version: string;
    plant_id: string;
    user_id: string;
    created_from_draft_id: string;
    scientific_name?: string | undefined;
}, {
    taxonomy_id: string;
    common_name: string;
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
    profile_version: string;
    plant_id: string;
    user_id: string;
    created_from_draft_id: string;
    scientific_name?: string | undefined;
}>;
export type PlantProfile = z.infer<typeof PlantProfileSchema>;
//# sourceMappingURL=profile.d.ts.map