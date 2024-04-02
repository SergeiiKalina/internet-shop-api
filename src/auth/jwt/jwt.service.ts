import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Jwt } from './jwt.model';
import * as jsonwebtoken from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtService {
  constructor(@InjectModel(Jwt.name) private readonly jwtModel: Model<Jwt>) {}

  generationJwt(payload) {
    try {
      const accessJwt = jsonwebtoken.sign(
        payload,
        process.env.JWT_ACCESS_SECRET_KEY,
        { expiresIn: '15s' },
      );
      const refreshJwt = jsonwebtoken.sign(
        payload,
        process.env.JWT_REFRESH_SECRET_KEY,
        {
          expiresIn: '30d',
        },
      );
      return {
        accessJwt,
        refreshJwt,
      };
    } catch (error) {
      console.log('call 122');
      console.log(error);
    }
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
      const userData = await jsonwebtoken.verify(
        token,
        process.env.JWT_REFRESH_SECRET_KEY,
      );

      if (typeof userData !== 'string') {
        return userData._doc as jsonwebtoken.JwtPayload;
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
