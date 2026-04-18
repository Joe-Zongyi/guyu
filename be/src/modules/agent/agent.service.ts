import { Injectable, Logger } from '@nestjs/common';
import { PlantAgent, FakeVisionProvider } from '@guyu/plant-agent';
import type {
  ProfileResponse,
  DailyAdviceResponse,
  StateAssessmentResponse,
  PixelArtGenerationResponse,
} from '@guyu/plant-agent';
import { FakeImageGenerationProvider } from '@guyu/plant-agent';

// Facade over the agent-layer PlantAgent orchestrator.
// Uses direct instantiation to avoid ESM DI issues.
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agent: PlantAgent;

  constructor() {
    this.agent = new PlantAgent({
      visionProvider: new FakeVisionProvider(),
      imageGenerationProvider: new FakeImageGenerationProvider(),
    });
    this.logger.log('AgentService ready');
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
