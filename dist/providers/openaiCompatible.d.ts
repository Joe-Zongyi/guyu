import { type ResolveImageSource } from "./imageSource.js";
import { type VisionAssessOutcome, type VisionAssessRequest, type VisionIdentifyOutcome, type VisionIdentifyRequest, type VisionProvider, type VisionProviderMetadata } from "./types.js";
export interface OpenAICompatibleVisionProviderOptions {
    apiKey: string;
    model?: string;
    timeoutMs?: number;
    baseURL?: string;
    resolveImage?: ResolveImageSource;
}
export declare class OpenAICompatibleVisionProvider implements VisionProvider {
    private readonly client;
    private readonly meta;
    private readonly resolveImage?;
    constructor(options: OpenAICompatibleVisionProviderOptions);
    metadata(): VisionProviderMetadata;
    identifyPlant(req: VisionIdentifyRequest): Promise<VisionIdentifyOutcome>;
    assessPlantState(req: VisionAssessRequest): Promise<VisionAssessOutcome>;
    private runJson;
}
//# sourceMappingURL=openaiCompatible.d.ts.map