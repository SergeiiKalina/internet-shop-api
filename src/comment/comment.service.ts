import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';

import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comment.model';
import { Model } from 'mongoose';
import { Product } from 'src/products/product.model';
import { User } from 'src/auth/user.model';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private readonly commentModel: Model<Comment>,
    @InjectModel(Product.name) private readonly productModel: Model<Product>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly userService: UserService,
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
      return { ...commentInstance.toObject(), author: user[0] };
    } else {
      const product = await this.productModel.findById(
        createCommentDto.product,
      );
      if (!product) {
        throw new Error('Продукт не знайдений');
      }

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

    const author = await this.userService.getUserWithNeedFields(
      comment.author,
      ['_id', 'firstName'],
    );
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

    let arrComments = [];

    // Створюємо проміси для отримання коментарів та їх авторів
    const commentWithAuthorPromises = product.comments.map(
      async (commentId) => {
        const comment = await this.getFullCommentsAndReplies(commentId);
        if (!comment) return null;

        const author = await this.userService.getUserWithNeedFields(
          comment.author,
          ['_id', 'firstName'],
        );
        return { comment, author };
      },
    );

    // Виконуємо паралельні запити за допомогою Promise.all
    const commentsWithAuthors = await Promise.all(commentWithAuthorPromises);

    // Обробляємо результати запитів
    commentsWithAuthors.forEach((item) => {
      if (item) {
        arrComments.push({ ...item.comment, author: item.author[0] });
      }
    });

    return arrComments;
  }

  async dislike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Не знайденно цей коментар');
    }

    const author = await this.userService.getUserWithNeedFields(
      comment.author,
      ['_id', 'firstName'],
    );
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

    return {
      ...comment.toObject(),
      author: author[0],
    };
  }

  async getFullCommentsAndReplies(id) {
    const comment = await this.commentModel.findById(id).lean();
    if (!comment) {
      throw new Error('Comment not found');
    }

    await this.returnAllReplies(comment);
    return comment;
  }

  private async returnAllReplies(parentComment) {
    const comments = parentComment.comments;
    if (!comments || comments.length === 0) {
      return;
    }

    const nestedCommentsPromises = comments.map(async (commentId) => {
      const nestedComment = await this.commentModel.findById(commentId).lean();
      if (!nestedComment) {
        return null;
      }

      const authorPromise = this.userService.getUserWithNeedFields(
        nestedComment.author,
        ['_id', 'firstName'],
      );

      return Promise.all([nestedComment, authorPromise]).then(
        ([comment, author]) => {
          const nestedCommentWithAuthor = { ...comment, author: author[0] };
          return this.returnAllReplies(nestedCommentWithAuthor).then(
            () => nestedCommentWithAuthor,
          );
        },
      );
    });

    const nestedComments = await Promise.all(nestedCommentsPromises);

    parentComment.comments = nestedComments.filter(
      (comment) => comment !== null,
    );

    for (let nestedComment of nestedComments) {
      if (nestedComment) {
        await this.returnAllReplies(nestedComment);
      }
    }
  }
}
