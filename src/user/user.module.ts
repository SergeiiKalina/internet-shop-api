import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserSchema } from 'src/auth/user.model';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/products/product.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }, // Provide the schema for the User model\
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
