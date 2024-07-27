import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import CommonModule from 'src/common.module';

@Module({
  imports: [CommonModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
