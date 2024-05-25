import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comment.model';
import { Model } from 'mongoose';
import { Product } from 'src/products/product.model';
import { User } from 'src/auth/user.model';

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
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new Error('Користувачь не авторизований');
    }
    const {
      password,
      isActivated,
      numberPhone,
      activationLink,
      lastLogout,
      registrationDate,
      rating,
      favorites,
      basket,
      ...restUser
    } = user.toObject();
    if (createCommentDto.parent) {
      const parent = await this.commentModel.findById({
        _id: createCommentDto.parent,
      });

      if (!parent) {
        throw new BadRequestException('Цього коментаря не існує');
      }

      await parent.comments.push(commentInstance.id);
      await parent.save();
      return { ...commentInstance.toObject(), author: restUser };
    } else {
      const product = await this.productModel.findById(
        createCommentDto.product,
      );
      if (!product) {
        throw new Error('Продукт не знайдений');
      }

      await product.comments.push(commentInstance.id);
      product.save();
      return { ...commentInstance.toObject(), author: restUser };
    }
  }

  async like(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Не знайденно цей коментар');
    }

    const author = await this.userModel.findById(comment.author);
    const { _id, firstName, ...authorRest } = author.toObject();
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

    return {
      ...comment.toObject(),
      author: { _id, firstName },
    };
  }

  async dislike(commentId: string, userId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new BadRequestException('Не знайденно цей коментар');
    }
    const author = await this.userModel.findById(comment.author);
    const { _id, firstName } = author.toObject();

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
      author: { _id, firstName },
    };
  }

  async getFullCommentsAndReplies(id: string) {
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

    const nestedComments = await Promise.all(
      comments.map(async (commentId) => {
        const nestedComment = await this.commentModel
          .findById(commentId)
          .lean();
        if (!nestedComment) {
          return null;
        }
        const author = await this.userModel.findById(nestedComment.author);
        const {
          password,
          isActivated,
          activationLink,
          lastName,
          numberPhone,
          lastLogout,
          registrationDate,
          rating,
          favorites,
          basket,
          email,
          ...restAuthor
        } = author.toObject();

        await this.returnAllReplies(nestedComment);
        return { ...nestedComment, author: restAuthor };
      }),
    );

    parentComment.comments = nestedComments.filter(
      (comment) => comment !== null,
    );

    for (const nestedComment of nestedComments) {
      if (nestedComment) {
        await this.returnAllReplies(nestedComment);
      }
    }
  }
}
