import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/user.model';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductsService,
  ) {}
  async addToFavorite(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    const product = await this.productService.findProductById(productId);

    if (!product) {
      throw new BadRequestException('Продукт не знайдений');
    }

    const checkProductInBasketIndex = await user.favorites.indexOf(productId);
    if (checkProductInBasketIndex !== -1) {
      return user;
    }
    await user.favorites.push(productId);
    await user.save();
    return user;
  }
  async removeFavorite(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    const product = await this.productService.findProductById(productId);

    if (!product) {
      throw new BadRequestException('Продукт не знайдений');
    }

    const checkProductInBasketIndex = await user.favorites.indexOf(productId);

    await user.favorites.splice(checkProductInBasketIndex, 1);
    await user.save();
    return user;
  }
}
