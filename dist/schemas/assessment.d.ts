import { z } from "zod";
export declare const PlantStateAssessmentSchema: z.ZodObject<{
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
export type PlantStateAssessment = z.infer<typeof PlantStateAssessmentSchema>;
export declare const RecentAssessmentSchema: z.ZodObject<{
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
}>;
export type RecentAssessment = z.infer<typeof RecentAssessmentSchema>;
//# sourceMappingURL=assessment.d.ts.map