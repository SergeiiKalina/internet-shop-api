import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'https://internet-shop-api-production.up.railway.app',
      'https://yevhenii-sulim.github.io',
      'http://localhost:3000',
    ],
    methods: 'GET, POST, PUT, DELETE, PATCH',
    credentials: true,
  });
  app.use(express.json());
  const config = new DocumentBuilder()
    .setTitle('Internet-Shop')
    .setDescription('Api for internet shop')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('API')
    .build();
  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-documentation', app, documentation);

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
