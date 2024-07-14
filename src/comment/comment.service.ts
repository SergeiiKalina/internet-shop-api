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
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async create(createCommentDto: CreateCommentDto, id: string) {
    const commentInstance = await this.commentModel.create({
      ...createCommentDto,
      rating:
        createCommentDto.parent === null ||
        !createCommentDto.parent ||
        createCommentDto.rating === 0
          ? createCommentDto.rating
          : null,
      author: id,
    });

    const user = await this.userModel.findById(id);
    const { _id, firstName } = user;

    if (createCommentDto.parent) {
      const parent = await this.commentModel.findById({
        _id: createCommentDto.parent,
      });

      if (!parent) {
        throw new BadRequestException('Цього коментаря не існує');
      }

      await parent.comments.push(commentInstance.id);
      await parent.save();
      await this.cacheManager.del(parent.product.toString());
      return { ...commentInstance.toObject(), author: { _id, firstName } };
    } else {
      const product = await this.productModel.findById(
        createCommentDto.product,
      );
      if (!product) {
        throw new Error('Продукт не знайдений');
      }

      const author = await this.userModel.findById(product.producer);
      author.rating.sum = (author.rating.sum || 0) + createCommentDto.rating;
      author.rating.count = (author.rating.count || 0) + 1;

      await author.save();

      await this.cacheManager.del(product.id.toString());

      await product.comments.push(commentInstance.id);
      product.save();

      return { ...commentInstance.toObject(), author: { _id, firstName } };
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

  async getAllFullCommentForProductAlt(id: string) {
    const allCommentMainComments = this.commentModel
      .find({ product: id, parent: null })
      .sort({ createDate: -1 });
    const allAnswersPromise = this.commentModel
      .find({ product: id, parent: { $ne: null } })
      .sort({ createDate: -1 });
    const [allComment, allAnswers] = await Promise.all([
      allCommentMainComments,
      allAnswersPromise,
    ]);

    const mapMainComments = new Map();
    const mapAnswers = new Map();

    allComment.forEach((comment) => {
      const commentObj = { ...comment.toObject(), answers: [] };
      delete commentObj.comments;
      mapMainComments.set(comment.id, commentObj);
    });

    allAnswers.forEach((answer) => {
      const answerObj = { ...answer.toObject(), answers: [] };
      delete answerObj.comments;
      mapAnswers.set(answer.id, answerObj);
    });

    for (const [key, value] of mapAnswers) {
      const parentKey = value.parent.toString();
      if (mapAnswers.has(parentKey)) {
        mapAnswers.get(parentKey).answers.push(value);
      }
    }

    for (const [key, value] of mapAnswers) {
      const parentKey = value.parent.toString();
      if (mapMainComments.has(parentKey)) {
        mapMainComments.get(parentKey).answers.push(value);
      }
    }

    return Array.from(mapMainComments.values());
  }

  async getAllFullCommentForProduct(
    comments: string | string[],
  ): Promise<any[]> {
    const idsArray = Array.isArray(comments) ? comments : [comments];

    const allComment = await this.commentModel
      .find({ _id: { $in: idsArray } })
      .populate('author', '_id firstName')
      .sort({ createDate: -1 })
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
