import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema()
export class Comment {
  @Prop({ required: true })
  body: string;
  @Prop({ default: () => Date.now() })
  createDate: Date;
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }] })
  like: string[];
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId }] })
  dislike: string[];
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  product: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);