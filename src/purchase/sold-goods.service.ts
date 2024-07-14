import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Purchase from './purchase.model';
import { Model } from 'mongoose';

@Injectable()
export class SoldGoodsService {
  constructor(
    @InjectModel(Purchase.name) private purchaseModel: Model<Purchase>,
  ) {}

  async getAllSoldGoods(ids: string[]) {
    const soldGoods = await this.purchaseModel.find({ id: { $in: ids } });

    return soldGoods;
  }
}
