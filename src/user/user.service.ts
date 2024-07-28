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
import { UpdateUserDto } from './dto/update-user.dto';
import { ImageService } from 'src/products/images-service/images.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly productService: ProductsService,
    private readonly purchaseService: PurchaseService,
    private readonly imageService: ImageService,
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

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const user = await this.userModel
      .findById(userId)
      .select(
        '-isActivated -activationLink -lastLogout -registrationDate -__v -favorites -basket -purchasedGoods -soldGoods ',
      );

    if (!user) {
      throw new BadRequestException('User not found');
    }
    let profilePictureSrc;
    if (file) {
      profilePictureSrc = await this.imageService.uploadPhoto(file);
    }
    let newPassword;
    if (updateUserDto.password) {
      newPassword = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    user.profilePictureSrc = profilePictureSrc ? profilePictureSrc : '';
    user.password = updateUserDto.password ? newPassword : user.password;
    await user.save();
    return user;
  }
}
