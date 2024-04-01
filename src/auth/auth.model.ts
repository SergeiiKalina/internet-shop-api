import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop({ default: false })
  isActivated: boolean;
  @Prop()
  firstName: string;
  @Prop()
  lastName: string;
  @Prop()
  numberPhone: string;
  @Prop()
  activationLink: string;
  @Prop({ default: () => Date.now() })
  registrationDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
