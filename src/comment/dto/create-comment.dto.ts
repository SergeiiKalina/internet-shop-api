import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';
import { Date } from 'mongoose';

export class CreateCommentDto {
  @ApiProperty({ type: String, description: 'Body of the comment' })
  @IsString()
  body: string;
  @ApiProperty({ type: String, description: 'Id product' })
  @IsString()
  product: string;
  @ApiProperty({
    type: String || null,
    description: 'Id of the comment that was replied to',
  })
  @IsOptional()
  parent?: string | null;
}
