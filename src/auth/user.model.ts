import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

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
    type: [MongooseSchema.Types.ObjectId],
  })
  basket: string[];
  @Prop({ default: [], type: [MongooseSchema.Types.ObjectId], ref: 'Product' })
  favorites: string[];
  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Purchase',
  })
  purchasedGoods: string[];
  @Prop({
    default: [],
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Purchase',
  })
  soldGoods: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
