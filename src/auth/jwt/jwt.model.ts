import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from '../auth.model';
import { Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Jwt {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  user: User;
  @Prop({ required: true })
  refreshJwt: string;
}
export const JwtSchema = SchemaFactory.createForClass(Jwt);
