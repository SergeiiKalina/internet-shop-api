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

  // async validateUser(email:string, password:string): Promise<any>{
  //   const user = this.findOne(email);
  //   if (user && user.password === password) {
  //     const { password, ...result } = user; // Remove password from user object before returning
  //     return result;
  //   }
  //   return null;
  // }



  // async login(email:string, password:string): Promise<any>{
    
  //   const user = this.findOne(email)

  //   if(user){
  //     const token = this.jwtService.generationJwt(user)
  //     return {user, token}
  //   }

  }




