import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserSchema } from './user.model';
import { Model } from 'mongoose';
import { RegistrationDto } from './dto/registrationDto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getAllUsers() {
    return this.userModel.find().exec();
  }
  async registration(newUser: RegistrationDto) {
    try {
      const { email } = newUser;
      const candidate = await this.userModel.findOne({ email });

      if (candidate) {
        throw new Error('This user has registered');
      }
      const user = await this.userModel.create(newUser);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
