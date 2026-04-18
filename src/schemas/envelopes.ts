import { z } from "zod";
import { ErrorCodeEnum, StatusEnum } from "./enums.js";
import { DailyAdviceSchema } from "./advice.js";
import { PlantProfileDraftSchema } from "./profile.js";
import { PlantStateAssessmentSchema } from "./assessment.js";

const baseEnvelope = {
  request_id: z.string(),
};

export const SuccessEnvelopeSchema = <T extends z.ZodTypeAny>(data: T) =>
  z.object({
    status: z.literal("success"),
    data,
    ...baseEnvelope,
  });

export const NeedsConfirmationEnvelopeSchema = <T extends z.ZodTypeAny>(
  data: T,
) =>
  z.object({
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
export type FailureEnvelope = z.infer<typeof FailureEnvelopeSchema>;

export const ProfileResponseSchema = z.union([
  NeedsConfirmationEnvelopeSchema(PlantProfileDraftSchema),
  FailureEnvelopeSchema,
]);
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;

export const DailyAdviceResponseSchema = z.union([
  SuccessEnvelopeSchema(DailyAdviceSchema),
  FailureEnvelopeSchema,
]);
export type DailyAdviceResponse = z.infer<typeof DailyAdviceResponseSchema>;

export const StateAssessmentResponseSchema = z.union([
  SuccessEnvelopeSchema(PlantStateAssessmentSchema),
  FailureEnvelopeSchema,
]);
export type StateAssessmentResponse = z.infer<
  typeof StateAssessmentResponseSchema
>;

export { StatusEnum };
