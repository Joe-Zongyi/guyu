import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module.js';
import { PlantsModule } from './modules/plants/plants.module.js';
import { AgentModule } from './modules/agent/agent.module.js';
import { DatabaseModule } from './database/database.module.js';
import { FilesModule } from './modules/files/files.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    DatabaseModule,
    AgentModule,
    HealthModule,
    PlantsModule,
    FilesModule,
  ],
})
export class AppModule {}
