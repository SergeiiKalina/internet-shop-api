import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comment.model';
import { Model } from 'mongoose';
import { Product } from 'src/products/product.model';
import { CreateProductDto } from 'src/products/dto/create-product.dto';
import { User } from 'src/auth/auth.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}
  async create(createCommentDto: CreateCommentDto, id: string) {
    const commentInstance = await this.commentModel.create({
      ...createCommentDto,
      author: id,
    });

    const product = await this.productModel.findById(createCommentDto.product);
    if (!product) {
      throw new Error('Product not found');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new Error('User not authorize');
    }
    const { password, ...restUser } = user.toObject();
    await product.comments.push(commentInstance.id);
    product.save();
    return { ...commentInstance.toObject(), author: restUser };
  }

  async like(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Not found this comment');
    }
    const likesArray = comment.like;
    const dislikesArray = comment.dislike;
    const likeIndex = likesArray.indexOf(userId);
    const disLikeIndex = dislikesArray.indexOf(userId);
    if (disLikeIndex === -1) {
      if (likeIndex !== -1) {
        likesArray.splice(likeIndex, 1);
      } else {
        likesArray.push(userId);
      }
    } else {
      dislikesArray.splice(likeIndex, 1);
      likesArray.push(userId);
    }

    comment.dislike = dislikesArray;
    comment.like = likesArray;

    await comment.save();

    return comment;
  }

  async dislike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Not found this comment');
    }
    const likesArray = comment.like;
    const dislikesArray = comment.dislike;
    const likeIndex = likesArray.indexOf(userId);
    const disLikeIndex = dislikesArray.indexOf(userId);
    if (likeIndex === -1) {
      if (disLikeIndex !== -1) {
        dislikesArray.splice(disLikeIndex, 1);
      } else {
        dislikesArray.push(userId);
      }
    } else {
      likesArray.splice(likeIndex, 1);
      dislikesArray.push(userId);
    }

    comment.dislike = dislikesArray;
    comment.like = likesArray;

    await comment.save();

    return comment;
  }

  update(id: number, updateCommentDto: UpdateCommentDto) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}