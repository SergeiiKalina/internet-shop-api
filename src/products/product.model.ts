import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
  @Prop({ default: 0 })
  visit: number;
  @Prop({ required: true })
  category?: string[];
  @Prop({ required: true })
  img: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
