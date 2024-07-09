import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export interface IParameter {
  color: string[];
  size: string[];
  state: string;
  brand: string;
  eco: boolean;
  sex: string;
  isUkraine: boolean;
}

@Schema()
export class Product {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  price: number;
  @Prop({ default: false })
  discount: boolean;
  @Prop({ default: 0 })
  discountPrice: number;
  @Prop({ default: () => Date.now() })
  createDate: Date;
  @Prop({
    default: () => [],
    type: [MongooseSchema.Types.ObjectId],
    ref: 'Comment',
  })
  comments: string[];
  @Prop({ default: 0 })
  visit: number;
  @Prop({
    required: true,
    type: String,
    ref: 'Category',
  })
  category: Types.ObjectId;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  producer: string;
  @Prop({
    required: false,
    type: String,
    ref: 'SubCategory',
    default: null,
  })
  subCategory: Types.ObjectId | null;
  @Prop({ required: true })
  img: string[];
  @Prop({ required: true })
  describe: string;

  @Prop({
    required: true,
    type: {
      color: {
        type: [MongooseSchema.Types.ObjectId],
        ref: 'Color',
      },
      size: { type: [String] },
      state: { type: String },
      brand: { type: String },
      eco: { type: Boolean },
      sex: { type: String },
      isUkraine: { type: Boolean },
    },
    default: {
      color: [],
      size: ['Без розміру'],
      state: 'Нове',
      brand: 'Без бренду',
      eco: true,
      sex: 'unsex',
      isUkraine: true,
    },
  })
  parameters: IParameter;
  @Prop({ type: String })
  minImage: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
