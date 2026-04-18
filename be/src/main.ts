import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { createBootstrapConsoleLogger } from './common/logging/bootstrap-console-logger.js';

async function bootstrap() {
  const appLogger = createBootstrapConsoleLogger();
  const app = await NestFactory.create(AppModule, {
    logger: appLogger,
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8787;
  await app.listen(port);

  appLogger.log(`Application is running on: http://localhost:${port}`, 'Bootstrap');
  appLogger.log(`Health check: http://localhost:${port}/health`, 'Bootstrap');
}

bootstrap();
