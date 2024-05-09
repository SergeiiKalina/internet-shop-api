import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as path from 'path';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(image: Express.Multer.File): Promise<Buffer> {
    if (!image || !image.buffer) {
      throw new BadRequestException('Подано недійсний файл зображення');
    }

    try {
      const resizedImageBuffer = await sharp(image.buffer)
        .resize(390, 480)
        .jpeg({ mozjpeg: true })
        .toBuffer();

      return resizedImageBuffer;
    } catch (error) {
      console.error('Помилка під час обробки зображення:', error);
      throw new BadRequestException('Помилка під час обробки зображення');
    }
  }
}
