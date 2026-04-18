import { Injectable, Logger } from '@nestjs/common';
import { PlantAgent } from '@guyu/plant-agent';
import type {
  ProfileResponse,
  DailyAdviceResponse,
  StateAssessmentResponse,
  PixelArtGenerationResponse,
} from '@guyu/plant-agent';
import { VisionProviderService } from './vision-provider.service.js';
import { ImageGenerationProviderService } from './image-generation-provider.service.js';

// Facade over the agent-layer PlantAgent orchestrator.
// Controllers depend on this service, never on PlantAgent directly, so we can later
// wrap it with retries/tracing/persistence without leaking changes outward.
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agent: PlantAgent;

  constructor(
    visionProviderService: VisionProviderService,
    imageGenerationProviderService: ImageGenerationProviderService,
  ) {
    this.agent = new PlantAgent({
      visionProvider: visionProviderService.getProvider(),
      imageGenerationProvider: imageGenerationProviderService.getProvider(),
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
