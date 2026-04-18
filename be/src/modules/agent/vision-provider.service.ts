import { Injectable, Logger } from '@nestjs/common';
import { FakeVisionProvider } from '@guyu/plant-agent';
import type { VisionProvider } from '@guyu/plant-agent';

// Thin adapter around the plant-agent vision providers.
// Centralizes provider selection so it can be swapped (fake / LLM / remote) via env without touching callers.
@Injectable()
export class VisionProviderService {
  private readonly logger = new Logger(VisionProviderService.name);
  private readonly provider: VisionProvider;

  constructor() {
    const kind = process.env['AGENT_VISION_PROVIDER'] ?? 'fake';
    switch (kind) {
      case 'fake':
      default:
        this.provider = new FakeVisionProvider();
        break;
    }
    this.logger.log(`VisionProvider initialized: ${kind}`);
  }

  getProvider(): VisionProvider {
    return this.provider;
  }
}
