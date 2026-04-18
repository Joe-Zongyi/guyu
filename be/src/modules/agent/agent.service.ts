import { Injectable, Logger } from '@nestjs/common';
import { PlantAgent } from '@guyu/plant-agent';
import type {
  ProfileResponse,
  DailyAdviceResponse,
  StateAssessmentResponse,
  PixelArtGenerationResponse,
} from '@guyu/plant-agent';
import {
  createVisionProviderFromEnv,
  createImageGenerationProviderFromEnv,
} from '@guyu/plant-agent';

// Facade over the agent-layer PlantAgent orchestrator.
// Uses direct instantiation to avoid ESM DI issues.
// Provider selection is driven by environment variables:
//   PLANT_AGENT_VISION_PROVIDER, PLANT_AGENT_IMAGE_GENERATION_PROVIDER
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agent: PlantAgent;

  constructor() {
    const visionProvider = createVisionProviderFromEnv();
    const imageGenerationProvider = createImageGenerationProviderFromEnv();

    this.agent = new PlantAgent({
      visionProvider,
      imageGenerationProvider,
    });

    this.logger.log(
      `AgentService ready (vision=${process.env.PLANT_AGENT_VISION_PROVIDER ?? 'fake'}, imageGen=${process.env.PLANT_AGENT_IMAGE_GENERATION_PROVIDER ?? 'fake'})`,
    );
  }

  async analyzeProfile(input: unknown): Promise<ProfileResponse> {
    return this.agent.analyzeProfile(input);
  }

  async generateDailyAdvice(input: unknown): Promise<DailyAdviceResponse> {
    return this.agent.generateDailyAdvice(input);
  }

  async assessState(input: unknown): Promise<StateAssessmentResponse> {
    return this.agent.assessState(input);
  }

  async generatePixelArt(input: unknown): Promise<PixelArtGenerationResponse> {
    return this.agent.generatePixelArt(input);
  }
}
