import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

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
  @ApiProperty({
    type: Number,
    description: 'product evaluation',
  })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(0, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must not exceed 5' })
  rating?: number;
}
