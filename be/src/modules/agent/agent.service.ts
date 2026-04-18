import { Injectable, Logger } from '@nestjs/common';
import { PlantAgent, FakeVisionProvider } from '@guyu/plant-agent';
import type {
  ProfileResponse,
  DailyAdviceResponse,
  StateAssessmentResponse,
} from '@guyu/plant-agent';

// Facade over the agent-layer PlantAgent orchestrator.
// Controllers depend on this service, never on PlantAgent directly, so we can later
// wrap it with retries/tracing/persistence without leaking changes outward.
@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private readonly agent: PlantAgent;

  constructor() {
    // Direct instantiation to avoid ESM DI issues
    const visionProvider = new FakeVisionProvider();
    this.agent = new PlantAgent({
      visionProvider,
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
}
