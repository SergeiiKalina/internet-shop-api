import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jwt } from './jwt.model';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Jwt.name) private readonly jwtModel: Model<Jwt>,
    private jwtService: JwtService,
  ) {}

  async generationJwt(payload) {
    try {
      const accessJwt = await this.jwtService.signAsync(payload);
      const refreshJwt = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
        expiresIn: '30d',
      });
      return {
        accessJwt,
        refreshJwt,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async validateAccessToken(accessToken: string) {
    const userData = await this.jwtService.verifyAsync(accessToken);
    if (userData) {
      return userData;
    }
    return null;
  }

  async safeJwt(userId, refreshJwt) {
    const tokenData = await this.jwtModel.findOne({ user: userId });

    if (tokenData) {
      tokenData.refreshJwt = refreshJwt;
      return tokenData.save();
    }

    const token = await this.jwtModel.create({ user: userId, refreshJwt });
    return token;
  }

  async validateRefreshToken(token: string) {
    try {
      const userData = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
      });

      if (typeof userData !== 'string') {
        return userData._doc;
      }
    } catch (error) {
      return null;
    }
  }
  async findJwt(refreshJwt: string) {
    try {
      const tokenData = await this.jwtModel.findOne({ refreshJwt });
      if (!tokenData) {
        throw new Error('Token not found');
      }
      return tokenData;
    } catch (error) {
      return null;
    }
  }
}
