import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

export class IBasketProduct {
  productId: string;
  quantity: number;
  constructor(productId, quantity) {
    this.productId = productId;
    this.quantity = quantity;
  }
}
export interface IPurchasedGoods {
  product: string;
  status?: string;
  roundImage: string;
  quantity: number;
}

export interface ISoldGoods {
  product: string;
  status?: string;
  roundImage: string;
  quantity: number;
}

export interface IRating {
  count: number;
  sum: number;
}

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ default: false })
  isActivated: boolean;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  numberPhone: string;
  @Prop()
  activationLink: string;
  @Prop({ default: () => Date.now() })
  registrationDate: Date;
  @Prop({ default: null }) // Example: Default value can be null if the user has never logged out
  lastLogout: Date;
  @Prop({
    type: { count: { type: Number }, sum: { type: Number } },
    default: { count: 0, sum: 0 },
  })
  rating: IRating;
  @Prop({
    default: () => [],
    type: [
      {
        productId: { type: MongooseSchema.Types.ObjectId },
        quantity: { type: Number },
      },
    ],
  })
  basket: IBasketProduct[];
  @Prop({ default: [], type: [MongooseSchema.Types.ObjectId], ref: 'Product' })
  favorites: string[];
  @Prop({
    default: [],
    type: [
      {
        product: { type: MongooseSchema.Types.ObjectId },
        status: { type: String, default: 'Очікується відправка' },
        roundImage: { type: String },
      },
    ],
    ref: 'Product',
  })
  purchasedGoods: IPurchasedGoods[];
  @Prop({
    default: [],
    type: [
      {
        product: { type: MongooseSchema.Types.ObjectId },
        status: { type: String, default: 'Очікується відправка' },
        roundImage: { type: String },
      },
    ],
    ref: 'Product',
  })
  soldGoods: ISoldGoods[];
}

export const UserSchema = SchemaFactory.createForClass(User);
