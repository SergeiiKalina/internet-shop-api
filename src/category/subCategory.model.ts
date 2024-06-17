import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
@Schema()
export class SubCategory {
  @Prop({
    required: true,
    type: MongooseSchema.Types.ObjectId,
    ref: 'Category',
  })
  mainCategory: string;
  @Prop({ type: Object })
  subCategory: Record<string, object>;
  @Prop({ required: true, type: String })
  img: string;
  @Prop({ required: false, type: [MongooseSchema.Types.ObjectId] })
  sizeChart: string;
  @Prop({ required: false, type: Boolean, default: false })
  color: boolean;
}

export const SubcategorySchema = SchemaFactory.createForClass(SubCategory);
