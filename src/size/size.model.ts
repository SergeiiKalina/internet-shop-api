import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Size {
  @Prop({ require: true, type: [String] })
  sizeChart: string[];
  @Prop({ require: true, type: [String] })
  subCategory: string[];
}

export const SizeSchema = SchemaFactory.createForClass(Size);
