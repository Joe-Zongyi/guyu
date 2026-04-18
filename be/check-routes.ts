import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module.js';

async function checkRoutes() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('Registered routes:');
  router.stack.forEach((layer: any) => {
    if (layer.route) {
      console.log(Object.keys(layer.route.methods).join(',') + ' ' + layer.route.path);
    }
  });

  await app.close();
}

checkRoutes();
