import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Class Validator
  app.useGlobalPipes(new ValidationPipe());
  // CORS
  app.enableCors();
  // Helmet
  app.use(helmet());
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
