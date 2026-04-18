import { Module } from '@nestjs/common';
import { PlantsController } from './plants.controller.js';
import { AgentModule } from '../agent/agent.module.js';

@Module({
  imports: [AgentModule],
  controllers: [PlantsController],
})
export class PlantsModule {}
