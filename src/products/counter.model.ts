import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CounterProducts {
  @Prop({ required: true, default: 0 })
  counter: number;
}

export const CounterSchema = SchemaFactory.createForClass(CounterProducts);
