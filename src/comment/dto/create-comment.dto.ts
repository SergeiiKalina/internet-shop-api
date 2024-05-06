import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsString } from 'class-validator';
import { Date } from 'mongoose';

export class CreateCommentDto {
  @ApiProperty({ type: String, description: 'Body of the comment' })
  @IsString()
  body: string;
  @ApiProperty({ type: String, description: 'Id product' })
  @IsString()
  product: string;
}
