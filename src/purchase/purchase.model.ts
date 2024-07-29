import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { statusPurchase } from './dto/change-status.dto';

@Schema()
export default class Purchase {
  @Prop({
    required: true,
    type: String,
    enum: statusPurchase,
    default: 'Очікується відправки',
  })
  status: string;
  @Prop({ required: true, type: String })
  firstName: string;
  @Prop({ required: true, type: String })
  lastName: string;
  @Prop({ required: false, type: String })
  email?: string;
  @Prop({ required: true, type: String })
  city: string;
  @Prop({ required: true, type: String })
  postOffice: string;
  @Prop({ required: true, type: String })
  tel: string;
  @Prop({ required: true, type: String })
  wayDelivery: string;
  @Prop({ required: true, type: String })
  pay: string;
  @Prop({ required: false, type: String })
  building?: string;
  @Prop({ default: () => Date.now() })
  createDate: Date;
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  producer: string;
  @Prop({ default: 1, required: true, type: Number })
  quantity: number;
}

export const PurchaseSchema = SchemaFactory.createForClass(Purchase);
