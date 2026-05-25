import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { ValidationException } from './common/exceptions';
import { BusinessExceptionFilter } from './common/filters/business-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new ValidationException('Solicitud inválida', errors),
    }),
  );
  app.useGlobalFilters(new BusinessExceptionFilter());
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap().catch((err: unknown) => {
  console.error('Error starting the application:', err);
});
