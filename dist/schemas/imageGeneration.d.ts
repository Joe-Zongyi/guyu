import { z } from "zod";
export declare const GeneratedImageSchema: z.ZodObject<{
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
}>;
export type GeneratedImage = z.infer<typeof GeneratedImageSchema>;
export declare const PixelArtGenerationSchema: z.ZodObject<{
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
export type PixelArtGeneration = z.infer<typeof PixelArtGenerationSchema>;
//# sourceMappingURL=imageGeneration.d.ts.map