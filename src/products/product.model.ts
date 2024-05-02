import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  price: string;
  @Prop({ default: false })
  eco: boolean;
  @Prop({ default: false })
  discount: boolean;
  @Prop()
  discountItem: string;
  @Prop({ default: () => Date.now() })
  createDate: Date;
  @Prop({ default: () => [] })
  comments: string[];
  @Prop({ default: 0 })
  visit: number;
  @Prop({ required: true })
  category?: string[];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  producer: string;
  @Prop()
  subCategory: string;
  @Prop({ required: true })
  img: string;
  @Prop({ required: true, default: 'Нове' })
  state: string;
  @Prop({ default: null })
  size: string;
  @Prop({ required: true })
  describe: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
