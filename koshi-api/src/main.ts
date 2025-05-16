import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { NodeEnvironment } from './types';
// import { auth } from '@/auth/auth';
import { Config } from './common/config/types';
import { configInstance } from './common/config';
import { validateConfig } from './common/config/config-validator';

export async function simpleApp() {
  return await NestFactory.create(AppModule);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin:
        process.env.NODE_ENV === NodeEnvironment.Prod &&
        configInstance.koshi.clientUrl,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    bodyParser: false,
    bufferLogs: true,
  });
  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  await setUpSwaggerUI(app);

  const logger = new NestLogger('Application');
  const configService = app.get(ConfigService);
  const port = configService.get(Config.Port);

  validateConfig(configInstance);

  await app.listen(port);
  logger.log(`Listening on :${port}`);
  if (process.env.NODE_ENV === NodeEnvironment.Dev) {
    logger.log(`better-auth swagger ui on localhost:1338/api/auth/reference`);
  }
}

bootstrap();

async function setUpSwaggerUI(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('Koshi API')
    .setDescription('things that you can can do')
    .setVersion('1.0')
    .addTag('koshi')
    .build();

  const nestDocument = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger-ui', app, nestDocument);
}
