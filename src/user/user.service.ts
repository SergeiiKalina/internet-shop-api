import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, isValidObjectId, Model } from 'mongoose';
import { User } from 'src/auth/user.model';
import { ProductsService } from 'src/products/products.service';
import { PurchaseService } from 'src/purchase/purchase.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductsService,
    private readonly purchaseService: PurchaseService,
  ) {}
  async getAllUsers() {
    return this.userModel.find().exec();
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new BadRequestException('Такого користувача не знайденно');
    }
    return user;
  }

  async findOneWithSession(id: string, session: ClientSession) {
    const user = await this.userModel.findById(id).session(session);
    if (!user) {
      throw new BadRequestException('Такого користувача не знайденно');
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }
  async getUser(id: string) {
    const user = await this.userModel.findById(id);
    const promiseFavorites = this.productService.getFewProducts(user.favorites);
    const promiseBasket = this.productService.getFewProducts(user.basket);
    const promisePurchases = this.purchaseService.getAllPurchase(
      user.purchasedGoods,
    );
    const promiseSoldGoods = this.purchaseService.getAllPurchase(
      user.soldGoods,
    );

    const [favorites, basket, purchases, soldGoods] = await Promise.all([
      promiseFavorites,
      promiseBasket,
      promisePurchases,
      promiseSoldGoods,
    ]);
    const { password, isActivated, activationLink, lastLogout, ...restUser } =
      user.toObject();
    return {
      ...restUser,
      basket: basket,
      favorites,
      purchasedGoods: purchases,
      soldGoods: soldGoods,
    };
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
