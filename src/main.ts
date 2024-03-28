import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Internet-Shop')
    .setDescription('Api for internet shop')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const documentation = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-documentation', app, documentation);

  await app.listen(80);
}
bootstrap();
