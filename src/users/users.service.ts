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
        return this.userModel.find().exec();
      }
    
}
