import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Model } from 'mongoose';
import { RegistrationDto } from './dto/registrationDto';
import { Mailer } from './mailer/mailer.service';
import { UserService } from 'src/user/user.service';
import { TokenService } from './jwt/jwt.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEmailLoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgotPassword.dto';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { randomBytes } from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly mailerService: Mailer,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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
      user.firstName,
      'Щоб підтвердити свою електронну адресу вам потрібно натиснути нижче!',
      'Підтвердіть свій Email',
      'Підтвердити адресу',
    );
    const tokens = await this.tokenService.generationJwt({
      ...user,
      id: user._id,
    });

    await this.tokenService.safeJwt(user.id, tokens.refreshJwt);

    return { ...tokens, user };
  }

  async login(loginDto: AuthEmailLoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });

    const payload = { email: user.email, sub: user.id }; // Using user ID as subject

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatches = await bcrypt.compare(password, user.password);

    if (!isPasswordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      user,
      backend_tokens: {
        token: await this.jwtService.sign({ id: user._id }),
        access_token: await this.jwtService.signAsync(
          { ...payload, id: user._id },
          {
            expiresIn: '1d',
            secret: process.env.JWT_SECRET,
          },
        ), // Change expiresIn value as needed
        refresh_token: await this.jwtService.signAsync(payload, {
          expiresIn: '7d',
          secret: process.env.JWT_REFRESH_TOKEN,
        }),
      },
    };
  }

  async refreshJwt(refreshJwt: string) {
    try {
      if (!refreshJwt) {
        throw new Error("User isn't authorized");
      }

      const userData = await this.tokenService.validateRefreshToken(refreshJwt);

      const tokenFromDb = await this.tokenService.findJwt(refreshJwt);
      if (!userData || !tokenFromDb) {
        throw new Error("User isn't authorized");
      }

      const user = await this.userModel.findById(userData._id);

      if (!user) {
        throw new Error('User not found');
      }

      const tokens = await this.tokenService.generationJwt({ ...user });

      await this.tokenService.safeJwt(user.id, tokens.refreshJwt);
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

  async forgotPassword(forgotPassword: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(forgotPassword.email);

    if (!user) {
      throw new BadRequestException('User with this email not found');
    }
    const forgotPasswordToken = await this.jwtService.signAsync({
      id: user._id,
      email: user.email,
    });
    const forgotLink = `${this.configService.get('API_URL_GIT')}auth/activate?token=${forgotPasswordToken}`;

    await this.mailerService.sendMail(
      forgotPassword.email,
      forgotLink,
      user.firstName,
      'Щоб змінити пароль вам потрібно натиснути нижче!',
      'Підтвердіть зміну паролю',
      'Підтвердити зміну паролю',
    );
    return true;
  }

  async changePassword(changePasswordDto: ChangePasswordDto, userId: string) {
    const password = await bcrypt.hash(changePasswordDto.password, 3);
    const user = await this.userModel.findById(userId);
    user.password = password;
    await user.save();
    return user;
  }

  async loginWithFacebook(user: { email: string; name: string }) {
    const userDb = await this.userService.findByEmail(user.email);

    if (!userDb) {
      const newUser = await this.registration({
        ...user,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1],
        numberPhone: '+380000000000',
        password: randomBytes(8).toString('hex'),
      });
      const { password, isActivated, activationLink, lastLogout, ...restUser } =
        newUser.user.toObject();
      return { ...newUser, user: { ...restUser } };
    }

    if (userDb) {
      const userFromDb = await this.userService.findByEmail(user.email);
      const { password, isActivated, activationLink, lastLogout, ...restUser } =
        userFromDb.toObject();
      const tokens = await this.tokenService.generationJwt({
        ...restUser,
        id: restUser._id,
      });
      return { ...tokens, user: restUser };
    }
  }

  async loginWithGoogle(user: {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
  }) {
    const userDb = await this.userService.findByEmail(user.email);

    if (!userDb) {
      const newUser = await this.registration({
        ...user,
        firstName: user.firstName,
        lastName: user.lastName,
        numberPhone: '+380000000000',
        password: randomBytes(8).toString('hex'),
      });
      const { password, isActivated, activationLink, lastLogout, ...restUser } =
        newUser.user.toObject();
      return { ...newUser, user: { ...restUser } };
    }

    if (userDb) {
      const userFromDb = await this.userService.findByEmail(user.email);
      const { password, isActivated, activationLink, lastLogout, ...restUser } =
        userFromDb.toObject();
      const tokens = await this.tokenService.generationJwt({
        ...restUser,
        id: restUser._id,
      });
      return { ...tokens, user: restUser };
    }
  }
}
