import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CounterPurchase {
  @Prop({ required: true, default: 0 })
  counter: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterPurchase);
