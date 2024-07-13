import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/user.model';
import { Model } from 'mongoose';
import { Mailer } from 'src/auth/mailer/mailer.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: Mailer,
    private readonly productService: ProductsService,
  ) {}
  async add(productId: string, userId: string, data: CreatePurchaseDto) {
    const user = await this.userModel.findById(userId);

    const product = await this.productService.findProductById(productId);
    const salesman = await this.userModel.findById(product.producer);
    user.purchasedGoods.push({
      product: product._id.toString(),
      roundImage: product.minImage,
      quantity: 1,
    });
    await user.save();
    salesman.purchasedGoods.push({
      product: product._id.toString(),
      roundImage: product.minImage,
      quantity: 1,
    });
    await salesman.save();

    const { password, activationLink, lastLogout, ...restUser } =
      user.toObject();
    await this.mailerService.orderGood(salesman.email, data, product);

    return restUser;
  }
}
