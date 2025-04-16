import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino';
import { type INestApplication } from '@nestjs/common';

function setUpSwaggerUI(app: INestApplication<any>) {
  const config = new DocumentBuilder()
    .setTitle('Koshi API')
    .setDescription('things that you can can do')
    .setVersion('1.0')
    .addTag('koshi')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger-ui', app, documentFactory)
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      // origin: "https://koshi.cire.sh", should be: config.ORIGIN_URL or similar
    },
    bodyParser: true,
    bufferLogs: true
  });
  app.useLogger(app.get(Logger))

  setUpSwaggerUI(app)

  await app.listen(1338);
  console.log("listening on 1338")
}

bootstrap();
