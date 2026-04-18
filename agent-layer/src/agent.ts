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
import {
  generatePixelArt,
  type GeneratePixelArtDeps,
} from "./capabilities/generatePixelArt.js";
import { FakeVisionProvider } from "./providers/fake.js";
import { FakeImageGenerationProvider } from "./providers/fakeImageGeneration.js";
import type { VisionProvider } from "./providers/types.js";
import type { ImageGenerationProvider } from "./providers/imageGeneration.js";
import type {
  DailyAdviceResponse,
  PixelArtGenerationResponse,
  ProfileResponse,
  StateAssessmentResponse,
} from "./schemas/envelopes.js";
import type { GeneratedImageStore } from "./assets/types.js";
import { PassthroughGeneratedImageStore } from "./assets/passthrough.js";

export interface PlantAgentOptions {
  visionProvider?: VisionProvider;
  imageGenerationProvider?: ImageGenerationProvider;
  generatedImageStore?: GeneratedImageStore;
  analyzeProfileDeps?: Omit<AnalyzeProfileDeps, "visionProvider">;
  assessStateDeps?: Omit<AssessStateDeps, "visionProvider">;
  generateDailyAdviceDeps?: GenerateDailyAdviceDeps;
}

export class PlantAgent {
  private readonly vision: VisionProvider;
  private readonly imageGeneration: ImageGenerationProvider;
  private readonly generatedImageStore: GeneratedImageStore;
  private readonly profileExtras: Omit<AnalyzeProfileDeps, "visionProvider">;
  private readonly assessExtras: Omit<AssessStateDeps, "visionProvider">;
  private readonly adviceDeps: GenerateDailyAdviceDeps;

  constructor(options: PlantAgentOptions = {}) {
    this.vision = options.visionProvider ?? new FakeVisionProvider();
    this.imageGeneration =
      options.imageGenerationProvider ?? new FakeImageGenerationProvider();
    this.generatedImageStore =
      options.generatedImageStore ?? new PassthroughGeneratedImageStore();
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

  generatePixelArt(input: unknown): Promise<PixelArtGenerationResponse> {
    return generatePixelArt(input, {
      imageGenerationProvider: this.imageGeneration,
      generatedImageStore: this.generatedImageStore,
    });
  }
}
