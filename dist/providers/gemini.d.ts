import { type ResolveImageSource } from "./imageSource.js";
import { type VisionAssessOutcome, type VisionAssessRequest, type VisionIdentifyOutcome, type VisionIdentifyRequest, type VisionProvider, type VisionProviderMetadata } from "./types.js";
export interface GeminiVisionProviderOptions {
    apiKey: string;
    model?: string;
    timeoutMs?: number;
    resolveImage?: ResolveImageSource;
}
export declare class GeminiVisionProvider implements VisionProvider {
    private readonly client;
    private readonly meta;
    private readonly resolveImage?;
    private readonly timeoutMs?;
    constructor(options: GeminiVisionProviderOptions);
    metadata(): VisionProviderMetadata;
    identifyPlant(req: VisionIdentifyRequest): Promise<VisionIdentifyOutcome>;
    assessPlantState(req: VisionAssessRequest): Promise<VisionAssessOutcome>;
    private runJson;
}
//# sourceMappingURL=gemini.d.ts.map