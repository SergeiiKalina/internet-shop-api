import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { UserService } from 'src/user/user.service';
import { ProductsService } from 'src/products/products.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/user.model';
import { Model } from 'mongoose';
import { TransformImageService } from 'src/products/images-service/transform-image.sevice';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,

    private readonly productService: ProductsService,
  ) {}
  async add(productId: string, userId: string) {
    const user = await this.userModel.findById(userId);

    const product = await this.productService.findProductById(productId);

    user.purchasedGoods.push({
      product: product._id.toString(),
      roundImage: product.minImage,
    });
    await user.save();

    const { password, activationLink, lastLogout, ...restUser } =
      user.toObject();
    return restUser;
  }
}
