import { z } from "zod";
import { CompareToPreviousEnum, OverallStateEnum, StateSignalEnum, } from "./enums.js";
import { Iso8601 } from "./primitives.js";
export const PlantStateAssessmentSchema = z.object({
    overall_state: OverallStateEnum,
    signals: z.array(StateSignalEnum).min(1),
    confidence: z.number().min(0).max(1),
    suggestions: z.array(z.string()),
    compare_to_previous: CompareToPreviousEnum,
    escalation_flag: z.boolean(),
});
export const RecentAssessmentSchema = z.object({
    overall_state: OverallStateEnum,
    signals: z.array(StateSignalEnum),
    assessed_at: Iso8601,
});
//# sourceMappingURL=assessment.js.map