import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from 'src/auth/user.model';
import { Product } from 'src/products/product.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
  ) {}
  async getAllUsers() {
    return this.userModel.find().exec();
  }
  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }
  async getUser(id: string) {
    const user = await this.userModel.findById(id);
    const newBasket = [];
    const newFavorite = [];
    for (let i = 0; i < user.basket.length; i++) {
      const product = await this.productModel.findById(
        user.basket[i].productId,
      );
      newBasket.push(product);
    }

    for (let i = 0; i < user.favorites.length; i++) {
      const product = await this.productModel.findById(user.favorites[i]);
      newFavorite.push(product);
    }
    return { ...user.toObject(), basket: newBasket, favorites: newFavorite };
  }
  async getGuestsUserInfo(userId: string) {
    if (!isValidObjectId(userId)) {
      throw new HttpException('Не дійсний ID', HttpStatus.NOT_FOUND); // Throw an error for invalid userId format
    }

    const user = await this.findOne(userId);

    if (!user) {
      throw new HttpException('Користувача не знайденно', HttpStatus.NOT_FOUND);
    }
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      numberPhone: user.numberPhone,
    };
  }

  async getUserWithNeedFields(
    ids: string | string[],
    fields: string[],
  ): Promise<Record<string, any> | Record<string, any>[]> {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    return this.userModel
      .find({ _id: { $in: idsArray } })
      .select(fields.join(' '))
      .exec();
  }
}
