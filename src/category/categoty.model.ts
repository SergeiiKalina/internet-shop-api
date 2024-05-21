import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Category {
  @Prop({ required: true, type: Object, default: {} })
  mainCategory: Record<string, object>;
  @Prop({ required: false, type: [MongooseSchema.Types.ObjectId], default: [] })
  subCategory: string[];
  @Prop({ required: true, type: String })
  img: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
