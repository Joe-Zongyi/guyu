import { Injectable, Logger } from '@nestjs/common';
import { createVisionProviderFromEnv } from '@guyu/plant-agent';
import type { VisionProvider } from '@guyu/plant-agent';

// Thin adapter around the plant-agent vision providers.
// Delegates to agent-layer's factory so provider selection is driven by
// PLANT_AGENT_VISION_PROVIDER and related env vars (see agent-layer/.env.example).
@Injectable()
export class VisionProviderService {
  private readonly logger = new Logger(VisionProviderService.name);
  private readonly provider: VisionProvider;

  constructor() {
    const kind = process.env['PLANT_AGENT_VISION_PROVIDER'] ?? 'fake';
    try {
      this.provider = createVisionProviderFromEnv(process.env);
      this.logger.log(`VisionProvider initialized: ${kind}`);
    } catch (err) {
      this.logger.error(
        `Failed to initialize vision provider (${kind}): ${(err as Error).message}. Check PLANT_AGENT_VISION_PROVIDER and related env vars.`,
      );
      throw err;
    }
  }

  getProvider(): VisionProvider {
    return this.provider;
  }
}
