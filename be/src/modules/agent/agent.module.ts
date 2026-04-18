import { Module } from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { VisionProviderService } from './vision-provider.service.js';
import { ImageGenerationProviderService } from './image-generation-provider.service.js';

// Sole owner of Agent-layer wiring. Any module that needs analyze/advice/assess/pixel-art
// should `imports: [AgentModule]` — never re-provide AgentService elsewhere.
@Module({
  providers: [
    VisionProviderService,
    ImageGenerationProviderService,
    AgentService,
  ],
  exports: [AgentService],
})
export class AgentModule {}
