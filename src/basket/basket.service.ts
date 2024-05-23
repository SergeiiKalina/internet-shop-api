import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/user.model';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class BasketService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductsService,
  ) {}
  async addToBasket(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    const product = await this.productService.findProductById(productId);
    if (!product) {
      throw new BadRequestException('Продукт не знайдений');
    }

    const checkProductInBasketIndex = await user.basket.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (checkProductInBasketIndex !== -1) {
      user.basket = [
        {
          ...user.basket[checkProductInBasketIndex],
          quantity: user.basket[checkProductInBasketIndex].quantity + 1,
        },
      ];
      await user.save();
      return user;
    }
    await user.basket.push({ productId: product.id, quantity: 1 });
    await user.save();
    return user;
  }

  async delete(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);
    const product = await this.productService.findProductById(productId);

    if (!product) {
      throw new NotFoundException('Продукт не знайдений');
    }

    const productIndex = user.basket.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (productIndex === -1) {
      throw new BadRequestException('Продукт не знайдений в коризині');
    }

    user.basket.splice(productIndex, 1);
    await user.save();
    return user;
  }

  async increase(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);

    const productIndex = user.basket.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (productIndex === -1) {
      throw new BadRequestException('Продукт не знайдений в корзині');
    }

    user.basket = [
      {
        ...user.basket[productIndex],
        quantity: user.basket[productIndex].quantity + 1,
      },
    ];
    await user.save();
    return user;
  }

  async decrease(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);

    const productIndex = user.basket.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (productIndex === -1) {
      throw new BadRequestException('Продукт не знайдений в корзині');
    }

    if (user.basket[productIndex].quantity === 1) {
      user.basket = [
        {
          ...user.basket[productIndex],
          quantity: user.basket[productIndex].quantity,
        },
      ];
      await user.save();
      return user;
    }

    user.basket = [
      {
        ...user.basket[productIndex],
        quantity: user.basket[productIndex].quantity - 1,
      },
    ];
    await user.save();
    return user;
  }
}
