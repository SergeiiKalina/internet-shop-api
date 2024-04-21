import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = User & Document;

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
  @Prop({ default: null }) // Example: Default value can be null if the user has never logged out
  lastLogout: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
