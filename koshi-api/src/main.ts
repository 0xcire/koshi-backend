import { NestFactory } from '@nestjs/core';
import { Logger as NestLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { NodeEnvironment } from './types';
// import { auth } from '@/auth/auth';
import { Config } from './common/config/types';
import { configInstance } from './common/config';
import { validateConfig } from './common/config/config-validator';
import { auth } from './auth/auth';
import { ComponentsObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

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
  const betterAuthOpenAPI = await auth.api.generateOpenAPISchema();

  const paths = Object.fromEntries(
    Object.entries(betterAuthOpenAPI.paths).map((path) => {
      return [`/api/auth${path[0]}`, path[1]];
    }),
  );

  for (const path in paths) {
    for (const method in paths[path]) {
      //@ts-expect-error mmm
      paths[path][method].tags = ['better auth'];

      if (path.includes('admin')) {
        //@ts-expect-error mmm
        paths[path][method].tags = ['better auth - admin'];
      }
    }
  }

  const document: OpenAPIObject = {
    openapi: nestDocument.openapi,
    paths: {
      ...nestDocument.paths,
      ...(paths as OpenAPIObject['paths']),
      ...(nestDocument.paths['/api/auth/{path}'] && {}),
    },
    info: nestDocument.info,
    tags: nestDocument.tags,
    servers: nestDocument.servers,
    components: {
      schemas: {
        ...nestDocument.components?.schemas,
        ...betterAuthOpenAPI.components.schemas,
      },
      securitySchemes: {
        ...(betterAuthOpenAPI.components
          .securitySchemes as ComponentsObject['securitySchemes']),
      },
    },
    security: betterAuthOpenAPI.security,
  };

  delete document.paths['/api/auth/{path}'];

  SwaggerModule.setup('swagger-ui', app, document);
}
