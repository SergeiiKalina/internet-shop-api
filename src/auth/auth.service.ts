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

  async login(dto: AuthEmailLoginDto) {
    const user = await this.validateUser(dto);

    const payload = { email: user.email, sub: user.id }; // Using user ID as subject

    return {
        user,
        backend_tokens: {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '20m', secret: process.env.JWT_SECRET }), // Change expiresIn value as needed
            refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_TOKEN }),
        }
    };
}

async validateUser(dto: AuthEmailLoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
        throw new UnauthorizedException('Invalid credentials');
    }

    try {
        const isMatch = await compare(dto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedException('Invalid credentials');
        }
    } catch (error) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...result } = user; // Omitting password from the returned user object

    return result;
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
