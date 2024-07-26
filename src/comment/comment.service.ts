import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comment.model';
import { Model, ClientSession } from 'mongoose';
import { Product } from '../products/product.model';
import { User } from '../auth/user.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  async processCommentCreation(createCommentDto: CreateCommentDto, id: string) {
    const session: ClientSession = await this.connection.startSession();
    session.startTransaction();
    try {
      const commentInstance = await this.createInstanceComment(
        createCommentDto,
        id,
        session,
      );
      const user = await this.userService.findOneWithSession(id, session);

      if (createCommentDto.parent) {
        await this.handleParentComment(
          createCommentDto,
          commentInstance,
          session,
        );
      } else {
        await this.handleProductComment(
          createCommentDto,
          commentInstance,
          session,
        );
      }

      await session.commitTransaction();
      return {
        ...commentInstance[0].toObject(),
        author: { _id: user._id, firstName: user.firstName },
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async handleParentComment(
    createCommentDto: CreateCommentDto,
    commentInstance: any,
    session: ClientSession,
  ) {
    const parent = await this.commentModel
      .findById({
        _id: createCommentDto.parent,
      })
      .session(session);

    if (!parent) {
      throw new BadRequestException('Цього коментаря не існує');
    }

    parent.comments.push(commentInstance[0].id);

    await parent.save({ session });

    await this.cacheManager.del(parent.product.toString());
  }

  async handleProductComment(
    createCommentDto: CreateCommentDto,
    commentInstance: any,
    session: ClientSession,
  ) {
    const product = await this.productModel
      .findById(createCommentDto.product)
      .session(session);
    if (!product) {
      throw new Error('Продукт не знайдений');
    }

    product.comments.push(commentInstance[0].id);
    await product.save({ session });

    const author = await this.userModel
      .findById(product.producer)
      .session(session);
    author.rating.sum = (author.rating.sum || 0) + createCommentDto.rating;
    author.rating.count = (author.rating.count || 0) + 1;

    await author.save({ session });
    await this.cacheManager.del(product.id.toString());
  }

  async createInstanceComment(
    createCommentDto: CreateCommentDto,
    authorId: string,
    session: ClientSession,
  ) {
    return await this.commentModel.create(
      [
        {
          ...createCommentDto,
          rating:
            createCommentDto.parent === null ||
            !createCommentDto.parent ||
            createCommentDto.rating === 0
              ? createCommentDto.rating
              : null,
          author: authorId,
        },
      ],
      { session },
    );
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
    const allComment = await this.getAllFullCommentForProduct(product.id);
    await this.cacheManager.del(comment.product.toString());
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
    const allComment = await this.getAllFullCommentForProduct(product.id);
    await this.cacheManager.del(comment.product.toString());
    return allComment;
  }

  async getAllFullCommentForProduct(id: string) {
    const allCommentMainComments = this.commentModel
      .find({ product: id, parent: null })
      .populate('author', '_id firstName')
      .sort({ createDate: -1 });
    const allAnswersPromise = this.commentModel
      .find({ product: id, parent: { $ne: null } })
      .populate('author', '_id firstName')
      .sort({ createDate: -1 });

    const [allComment, allAnswers] = await Promise.all([
      allCommentMainComments,
      allAnswersPromise,
    ]);

    const mapMainComments = new Map();
    const mapAnswers = new Map();

    allComment.forEach((comment) => {
      const commentObj = { ...comment.toObject(), comments: [] };
      mapMainComments.set(comment.id, commentObj);
    });

    allAnswers.forEach((answer) => {
      const answerObj = { ...answer.toObject(), comments: [] };
      mapAnswers.set(answer.id, answerObj);
    });

    for (const [key, value] of mapAnswers) {
      const parentKey = value.parent.toString();
      if (mapAnswers.has(parentKey)) {
        mapAnswers.get(parentKey).comments.push(value);
        mapAnswers.delete(key);
      }
    }

    for (const [key, value] of mapAnswers) {
      const parentKey = value.parent.toString();
      if (mapMainComments.has(parentKey)) {
        mapMainComments.get(parentKey).comments.push(value);
        mapAnswers.delete(key);
      }
    }

    return Array.from(mapMainComments.values());
  }
}
