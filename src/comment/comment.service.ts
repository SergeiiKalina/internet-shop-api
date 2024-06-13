import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comment.model';
import { Model } from 'mongoose';
import { Product } from 'src/products/product.model';
import { User } from 'src/auth/user.model';
import { UserService } from 'src/user/user.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createCommentDto: CreateCommentDto, id: string) {
    const commentInstance = await this.commentModel.create({
      ...createCommentDto,
      author: id,
    });
    const user = await this.userService.getUserWithNeedFields(id, [
      '_id',
      'firstName',
    ]);

    if (createCommentDto.parent) {
      const parent = await this.commentModel.findById({
        _id: createCommentDto.parent,
      });

      if (!parent) {
        throw new BadRequestException('Цього коментаря не існує');
      }

      await parent.comments.push(commentInstance.id);
      await parent.save();
      await this.cacheManager.del(parent.product);
      return { ...commentInstance.toObject(), author: user[0] };
    } else {
      const product = await this.productModel.findById(
        createCommentDto.product,
      );
      if (!product) {
        throw new Error('Продукт не знайдений');
      }
      await this.cacheManager.del(product.id);

      await product.comments.push(commentInstance.id);
      product.save();
      return { ...commentInstance.toObject(), author: user[0] };
    }
  }

  async like(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Не знайденно цей коментар');
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

    const product = await this.productModel.findById(comment.product);
    const allComment = await this.getAllFullCommentForProduct(product.comments);

    return allComment;
  }

  async dislike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Не знайденно цей коментар');
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

    const product = await this.productModel.findById(comment.product);
    const allComment = await this.getAllFullCommentForProduct(product.comments);

    return allComment;
  }

  async getAllFullCommentForProduct(
    comments: string | string[],
  ): Promise<any[]> {
    const idsArray = Array.isArray(comments) ? comments : [comments];
    const allComment = await this.commentModel
      .find({ _id: { $in: idsArray } })
      .populate('author', '_id firstName')
      .lean();

    for (const comment of allComment) {
      if (comment.comments && comment.comments.length > 0) {
        comment.comments = await this.getAllFullCommentForProduct(
          comment.comments,
        );
      }
    }

    return allComment;
  }
}
