import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './auth.model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import { RegistrationDto } from './dto/registrationDto';
import { Mailer } from './mailer/mailer.service';
import { UsersService } from 'src/users/users.service';
import { TokenService } from './jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEmailLoginDto } from './dto/login.dto';
import { compare } from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: Mailer,
    private readonly TokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  
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
    const tokens = await this.TokenService.generationJwt({ ...user });

    await this.TokenService.safeJwt(user.id, tokens.refreshJwt);

    return { ...tokens, user };
  }

  // async validateUser(userId: string, password: string): Promise<any> {
  //   const user = await this.usersService.findOne(userId);
  //   if (user && user.password === password) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  async login( loginDto: AuthEmailLoginDto ){
          const { email, password } = loginDto;
 
          const user= await this.userModel.findOne({email})
 
          if(!user){
           throw new UnauthorizedException('Invalid email or password')
          } 
  
          const isPasswordMatches = await bcrypt.compare(password, user.password)
  
          const token= this.jwtService.sign({id: user._id})
 
          return {user, token}; 
  }

  async refreshJwt(refreshJwt: string) {
    try {
      if (!refreshJwt) {
        throw new Error("User isn't authorized");
      }

      const userData = await this.TokenService.validateRefreshToken(refreshJwt);

      const tokenFromDb = await this.TokenService.findJwt(refreshJwt);
      if (!userData || !tokenFromDb) {
        throw new Error("User isn't authorized");
      }

      const user = await this.userModel.findById(userData._id);

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = await this.TokenService.generationJwt({ ...user });

      await this.TokenService.safeJwt(user.id, tokens.refreshJwt);
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
