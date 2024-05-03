import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from 'src/auth/auth.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  async getAllUsers() {
    return this.userModel.find().exec();
  }
  async findOne(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }
  async getUser(id: string) {
    return await this.userModel.findById(id);
  }
  async getGuestsUserInfo(userId: string) {
    
    if (!isValidObjectId(userId)) {
      throw new HttpException('Invalid userId',  HttpStatus.NOT_FOUND); // Throw an error for invalid userId format
    }

    const user = await this.findOne(userId);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      numberPhone: user.numberPhone,
    }
  }
}
