import { type VisionAssessOutcome, type VisionAssessRequest, type VisionIdentifyOutcome, type VisionIdentifyRequest, type VisionProvider, type VisionProviderMetadata } from "./types.js";
export interface FakeVisionProviderOptions {
    metadata?: Partial<VisionProviderMetadata>;
    defaultIdentified?: string;
}
export declare class FakeVisionProvider implements VisionProvider {
    private readonly meta;
    private readonly defaultIdentified;
    constructor(options?: FakeVisionProviderOptions);
    metadata(): VisionProviderMetadata;
    identifyPlant(req: VisionIdentifyRequest): Promise<VisionIdentifyOutcome>;
    assessPlantState(req: VisionAssessRequest): Promise<VisionAssessOutcome>;
}
//# sourceMappingURL=fake.d.ts.map