import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Class Validator
  app.useGlobalPipes(new ValidationPipe());
  // CORS
  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({
    origin: configService.get('APP_FRONT_URL'),
    credentials: true,
  });
  // Helmet
  app.use(helmet());
  // Cookie Parser
  app.use(cookieParser());
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
