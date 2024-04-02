import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Internet-Shop')
    .setDescription('Api for internet shop')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api-documentation', app, documentation);

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
