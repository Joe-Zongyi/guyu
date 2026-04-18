import {
  analyzeProfile,
  type AnalyzeProfileDeps,
} from "./capabilities/analyzeProfile.js";
import {
  generateDailyAdvice,
  type GenerateDailyAdviceDeps,
} from "./capabilities/generateDailyAdvice.js";
import {
  assessState,
  type AssessStateDeps,
} from "./capabilities/assessState.js";
import { FakeVisionProvider } from "./providers/fake.js";
import type { VisionProvider } from "./providers/types.js";
import type {
  DailyAdviceResponse,
  ProfileResponse,
  StateAssessmentResponse,
} from "./schemas/envelopes.js";

export interface PlantAgentOptions {
  visionProvider?: VisionProvider;
  analyzeProfileDeps?: Omit<AnalyzeProfileDeps, "visionProvider">;
  assessStateDeps?: Omit<AssessStateDeps, "visionProvider">;
  generateDailyAdviceDeps?: GenerateDailyAdviceDeps;
}

export class PlantAgent {
  private readonly vision: VisionProvider;
  private readonly profileExtras: Omit<AnalyzeProfileDeps, "visionProvider">;
  private readonly assessExtras: Omit<AssessStateDeps, "visionProvider">;
  private readonly adviceDeps: GenerateDailyAdviceDeps;

  constructor(options: PlantAgentOptions = {}) {
    this.vision = options.visionProvider ?? new FakeVisionProvider();
    this.profileExtras = options.analyzeProfileDeps ?? {};
    this.assessExtras = options.assessStateDeps ?? {};
    this.adviceDeps = options.generateDailyAdviceDeps ?? {};
  }

  analyzeProfile(input: unknown): Promise<ProfileResponse> {
    return analyzeProfile(input, {
      visionProvider: this.vision,
      ...this.profileExtras,
    });
  }

  generateDailyAdvice(input: unknown): Promise<DailyAdviceResponse> {
    return generateDailyAdvice(input, this.adviceDeps);
  }

  assessState(input: unknown): Promise<StateAssessmentResponse> {
    return assessState(input, {
      visionProvider: this.vision,
      ...this.assessExtras,
    });
  }
}
