import { z } from "zod";
import { ErrorCodeEnum, StatusEnum } from "./enums.js";
import { DailyAdviceSchema } from "./advice.js";
import { PlantProfileDraftSchema } from "./profile.js";
import { PlantStateAssessmentSchema } from "./assessment.js";
import { PixelArtGenerationSchema } from "./imageGeneration.js";
const baseEnvelope = {
    request_id: z.string(),
};
export const SuccessEnvelopeSchema = (data) => z.object({
    status: z.literal("success"),
    data,
    ...baseEnvelope,
});
export const NeedsConfirmationEnvelopeSchema = (data) => z.object({
    status: z.literal("needs_confirmation"),
    data,
    ...baseEnvelope,
});
export const FailureEnvelopeSchema = z.object({
    status: z.union([z.literal("failed"), z.literal("needs_retry")]),
    error_code: ErrorCodeEnum,
    message: z.string(),
    ...baseEnvelope,
});
export const ProfileResponseSchema = z.union([
    NeedsConfirmationEnvelopeSchema(PlantProfileDraftSchema),
    FailureEnvelopeSchema,
]);
export const DailyAdviceResponseSchema = z.union([
    SuccessEnvelopeSchema(DailyAdviceSchema),
    FailureEnvelopeSchema,
]);
export const StateAssessmentResponseSchema = z.union([
    SuccessEnvelopeSchema(PlantStateAssessmentSchema),
    FailureEnvelopeSchema,
]);
export const PixelArtGenerationResponseSchema = z.union([
    SuccessEnvelopeSchema(PixelArtGenerationSchema),
    FailureEnvelopeSchema,
]);
export { StatusEnum };
//# sourceMappingURL=envelopes.js.map