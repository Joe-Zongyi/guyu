import { z } from "zod";
import { ProviderMetadataSchema } from "./profile.js";

export const GeneratedImageSchema = z.object({
  file_id: z.string().min(1),
  url: z.string().url(),
  content_type: z.string().min(1).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});
export type GeneratedImage = z.infer<typeof GeneratedImageSchema>;

export const PixelArtGenerationSchema = z.object({
  source_image_id: z.string().min(1),
  style: z.literal("pixel_art"),
  images: z.array(GeneratedImageSchema).min(1),
  provider_metadata: ProviderMetadataSchema,
});
export type PixelArtGeneration = z.infer<typeof PixelArtGenerationSchema>;
