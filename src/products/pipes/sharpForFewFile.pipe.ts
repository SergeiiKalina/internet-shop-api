import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class SharpPipe
  implements PipeTransform<Express.Multer.File[], Promise<Buffer[] | []>>
{
  async transform(images: Express.Multer.File[]): Promise<Buffer[] | []> {
    if (!images || images.length === 0) {
      return [];
    }

    try {
      const resizedImageBuffers = await Promise.all(
        images.map(async (image) => {
          if (!image || !image.buffer) {
            throw new BadRequestException('Подано недійсний файл зображення');
          }

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
        }),
      );

      return resizedImageBuffers;
    } catch (error) {
      console.error('Помилка під час обробки зображень:', error);
      throw new BadRequestException('Помилка під час обробки зображень');
    }
  }
}
