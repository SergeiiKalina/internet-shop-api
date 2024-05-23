import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Color {
  @Prop({ required: true, type: String })
  colorName: string;
  @Prop({ required: true, type: String })
  color: string;
}

export const ColorSchema = SchemaFactory.createForClass(Color);
