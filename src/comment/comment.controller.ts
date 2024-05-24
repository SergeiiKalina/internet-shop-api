import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return await this.commentService.create(createCommentDto, req.user.id);
  }

  @Post('like')
  @UseGuards(JwtAuthGuard)
  async like(@Body() { commentId }: { commentId: string }, @Req() req) {
    const userId = req.user.id;
    return this.commentService.like(commentId, userId);
  }
  @Post('dislike')
  @UseGuards(JwtAuthGuard)
  async dislike(@Body() { commentId }: { commentId: string }, @Req() req) {
    const userId = req.user.id;

    return this.commentService.dislike(commentId, userId);
  }
}
