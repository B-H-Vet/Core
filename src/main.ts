import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap().catch((err: unknown) => {
  console.error('Error starting the application:', err);
});
