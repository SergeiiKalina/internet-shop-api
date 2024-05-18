import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpForOneFile
  implements PipeTransform<Express.Multer.File, Promise<Buffer>>
{
  async transform(image: Express.Multer.File): Promise<Buffer> {
    if (!image || !image.buffer) {
      throw new BadRequestException('Подано недійсний файл зображення');
    }

    try {
      const resizedImageBuffer = await sharp(image.buffer)
        .resize({
          width: 390,
          height: 480,
          fit: 'contain',
          withoutEnlargement: false,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({ compressionLevel: 9 })
        .toBuffer();

      return resizedImageBuffer;
    } catch (error) {
      console.error('Помилка під час обробки зображення:', error);
      throw new BadRequestException('Помилка під час обробки зображення');
    }
  }
}
