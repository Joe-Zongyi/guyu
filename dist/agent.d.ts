import { type AnalyzeProfileDeps } from "./capabilities/analyzeProfile.js";
import { type GenerateDailyAdviceDeps } from "./capabilities/generateDailyAdvice.js";
import { type AssessStateDeps } from "./capabilities/assessState.js";
import type { VisionProvider } from "./providers/types.js";
import type { ImageGenerationProvider } from "./providers/imageGeneration.js";
import type { DailyAdviceResponse, PixelArtGenerationResponse, ProfileResponse, StateAssessmentResponse } from "./schemas/envelopes.js";
import type { GeneratedImageStore } from "./assets/types.js";
export interface PlantAgentOptions {
    visionProvider?: VisionProvider;
    imageGenerationProvider?: ImageGenerationProvider;
    generatedImageStore?: GeneratedImageStore;
    analyzeProfileDeps?: Omit<AnalyzeProfileDeps, "visionProvider">;
    assessStateDeps?: Omit<AssessStateDeps, "visionProvider">;
    generateDailyAdviceDeps?: GenerateDailyAdviceDeps;
}
export declare class PlantAgent {
    private readonly vision;
    private readonly imageGeneration;
    private readonly generatedImageStore;
    private readonly profileExtras;
    private readonly assessExtras;
    private readonly adviceDeps;
    constructor(options?: PlantAgentOptions);
    analyzeProfile(input: unknown): Promise<ProfileResponse>;
    generateDailyAdvice(input: unknown): Promise<DailyAdviceResponse>;
    assessState(input: unknown): Promise<StateAssessmentResponse>;
    generatePixelArt(input: unknown): Promise<PixelArtGenerationResponse>;
}
//# sourceMappingURL=agent.d.ts.map