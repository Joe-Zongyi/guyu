import { Injectable, Logger } from '@nestjs/common';
import { createImageGenerationProviderFromEnv } from '@guyu/plant-agent';
import type { ImageGenerationProvider } from '@guyu/plant-agent';

// Thin adapter around the plant-agent image generation providers.
// Provider selection is driven by PLANT_AGENT_IMAGE_GENERATION_PROVIDER
// (fake | openrouter). See agent-layer/.env.example for full reference.
@Injectable()
export class ImageGenerationProviderService {
  private readonly logger = new Logger(ImageGenerationProviderService.name);
  private readonly provider: ImageGenerationProvider;

  constructor() {
    const kind =
      process.env['PLANT_AGENT_IMAGE_GENERATION_PROVIDER'] ?? 'fake';
    try {
      this.provider = createImageGenerationProviderFromEnv(process.env);
      this.logger.log(`ImageGenerationProvider initialized: ${kind}`);
    } catch (err) {
      this.logger.error(
        `Failed to initialize image generation provider (${kind}): ${(err as Error).message}. Check PLANT_AGENT_IMAGE_GENERATION_PROVIDER and related env vars.`,
      );
      throw err;
    }
  }

  getProvider(): ImageGenerationProvider {
    return this.provider;
  }
}
