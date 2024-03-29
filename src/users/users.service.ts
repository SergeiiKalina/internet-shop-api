import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
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
      const { email, password } = newUser;
      const candidate = await this.userModel.findOne({ email });

      if (candidate) {
        throw new Error('This user has registered');
      }
      const hashPassword = await bcrypt.hash(password, 3);
      const user = await this.userModel.create({
        ...newUser,
        password: hashPassword,
      });
      return user;
    } catch (error) {
      throw error;
    }
  }
}
