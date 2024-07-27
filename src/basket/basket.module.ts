import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { CommentModule } from 'src/comment/comment.module';

import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule, CommentModule],
  controllers: [BasketController],
  providers: [BasketService],
})
export class BasketModule {}
