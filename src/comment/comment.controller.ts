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
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async create(
    @Body(new ValidationPipe()) createCommentDto: CreateCommentDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    return await this.commentService.processCommentCreation(
      createCommentDto,
      userId,
    );
  }

  @Post('like')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async like(@Body() { commentId }: { commentId: string }, @Req() req) {
    const userId = req.user.id;
    return this.commentService.like(commentId, userId);
  }
  @Post('dislike')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async dislike(@Body() { commentId }: { commentId: string }, @Req() req) {
    const userId = req.user.id;

    return this.commentService.dislike(commentId, userId);
  }
}
