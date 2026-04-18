import { Module } from '@nestjs/common';
import { PlantsController } from './plants.controller.js';
import { PlantsService } from './plants.service.js';
import { AgentModule } from '../agent/agent.module.js';
import { DatabaseModule } from '../../database/database.module.js';

@Module({
  imports: [AgentModule, DatabaseModule],
  controllers: [PlantsController],
  providers: [PlantsService],
  exports: [PlantsService],
})
export class PlantsModule {}
