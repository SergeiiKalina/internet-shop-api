import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/user.model';
import { Model } from 'mongoose';
import { Mailer } from 'src/auth/mailer/mailer.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import Purchase from './purchase.model';
import { aggregateForAllPurchases } from './aggregates/aggregates';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
    private readonly mailerService: Mailer,
    private readonly productService: ProductsService,
  ) {}
  async add(productId: string, data: CreatePurchaseDto, userId?: string) {
    let promiseUser = Promise.resolve(null);
    if (userId) {
      promiseUser = this.userModel.findById(userId);
    }

    const promiseProduct = this.productService.findProductById(productId);
    const [user, product] = await Promise.all([promiseUser, promiseProduct]);

    if (!product) {
      throw new BadRequestException('Щось пішло не так');
    }

    const salesman = await this.userModel.findById(product.producer);

    if (!salesman) {
      throw new BadRequestException('Продавця не знайденно');
    }

    const purchase = await this.purchaseModel.create({
      ...data,
      producer: salesman.id,
      product: product.id,
    });

    if (user) {
      user.purchasedGoods.push(purchase.id);

      await user.save();
    }

    salesman.soldGoods.push(purchase.id);

    await salesman.save();

    await this.mailerService.orderGood(
      salesman.email,
      data,
      product._id.toString(),
      product,
    );
    await this.mailerService.sendInfoAboutOrder(
      data.email,
      salesman.email,
      salesman.numberPhone,
      product,
      data.quantity,
    );
    return purchase;
  }

  async changeStatus(idPurchase: string, status: string, producerId: string) {
    const promisePurchases = this.purchaseModel.findById(idPurchase);
    const promiseProducer = this.userModel.findById(producerId);

    const [purchases, producer] = await Promise.all([
      promisePurchases,
      promiseProducer,
    ]);

    if (purchases.producer !== producer.id) {
      throw new BadRequestException('Цей продукт продаєте не ви');
    }

    purchases.status = status;
    await purchases.save();

    return purchases;
  }

  async getAllPurchase(ids: string[]) {
    const purchases = await this.purchaseModel.aggregate([
      { $match: { _id: { $in: ids } } },
      ...aggregateForAllPurchases,
    ]);

    return purchases;
  }

  async delete(id: string) {
    return await this.purchaseModel.findByIdAndDelete(id);
  }
}
