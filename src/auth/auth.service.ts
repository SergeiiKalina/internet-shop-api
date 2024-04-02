import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import { RegistrationDto } from './dto/registrationDto';
import { Mailer } from './mailer/mailer.service';
import { JwtService } from './jwt/jwt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: Mailer,
    private readonly jwtService: JwtService,
  ) {}

  async getAllUsers() {
    return this.userModel.find().exec();
  }
  async registration(newUser: RegistrationDto) {
    const { email, password } = newUser;
    const candidate = await this.userModel.findOne({ email });

    if (candidate) {
      throw new Error('This user has registered');
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();
    const user = await this.userModel.create({
      ...newUser,
      password: hashPassword,
      activationLink,
    });
    await this.mailerService.sendMail(
      email,
      `${process.env.API_URL}/auth/activate/${activationLink}`,
    );
    const tokens = await this.jwtService.generationJwt({ ...user });

    await this.jwtService.safeJwt(user.id, tokens.refreshJwt);

    return { ...tokens, user };
  }

  async refreshJwt(refreshJwt: string) {
    try {
      if (!refreshJwt) {
        throw new Error("User isn't authorized");
      }

      const userData = await this.jwtService.validateRefreshToken(refreshJwt);

      const tokenFromDb = await this.jwtService.findJwt(refreshJwt);
      if (!userData || !tokenFromDb) {
        throw new Error("User isn't authorized");
      }

      const user = await this.userModel.findById(userData._id);

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = await this.jwtService.generationJwt({ ...user });

      await this.jwtService.safeJwt(user.id, tokens.refreshJwt);
      return { ...tokens, user };
    } catch (error) {
      console.error(error);
    }
  }

  async activate(link: string) {
    const user = await this.userModel.findOne({ activationLink: link });
    if (!user) {
      throw new Error('This link is not correct');
    }

    user.isActivated = true;

    await user.save();
  }
}
