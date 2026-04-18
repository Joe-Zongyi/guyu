import { Module } from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { VisionProviderService } from './vision-provider.service.js';

// Sole owner of Agent-layer wiring. Any module that needs analyze/advice/assess
// should `imports: [AgentModule]` — never re-provide AgentService elsewhere.
@Module({
  providers: [VisionProviderService, AgentService],
  exports: [AgentService],
})
export class AgentModule {}
