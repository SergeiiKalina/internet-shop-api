import { Module } from '@nestjs/common';
import { join } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { User, UserSchema } from './auth/user.model';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';
import { Jwt, JwtSchema } from './auth/jwt/jwt.model';
import { UserModule } from './user/user.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ProductsModule } from './products/products.module';
import { CommentModule } from './comment/comment.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BasketModule } from './basket/basket.module';
import { FavoriteModule } from './favorite/favorite.module';
import { CategoryModule } from './category/category.module';
import { ColorModule } from './color/color.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://trainingfromsergijkalyna:I3FEDP34PHQX6lZp@cluster0.tqsxfke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    ),
    MulterModule.register({
      storage: memoryStorage(),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Jwt.name, schema: JwtSchema },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        transport: {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT, 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        },
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    AuthModule,
    UserModule,
    User,
    ProductsModule,
    CommentModule,
    BasketModule,
    FavoriteModule,
    CategoryModule,
    ColorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
