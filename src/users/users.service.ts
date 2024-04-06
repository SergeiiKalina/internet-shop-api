import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/auth.model';

@Injectable()
export class UsersService {
    constructor(
    @InjectModel(User.name) private userModel: Model<User>
    ){}
    async getAllUsers() {
      }
    async findOne(id: string):Promise<User | null>{
      return this.userModel.findById(id).exec();
    }
    async findByEmail(email: string) {
      return await this.userModel.findOne({ email }).exec();
  }
  
}
