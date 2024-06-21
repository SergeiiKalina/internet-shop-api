import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as sharp from 'sharp';

@Injectable()
export class TransformImageService
  implements PipeTransform<Express.Multer.File, Promise<Express.Multer.File>>
{
  async transform(image: Express.Multer.File): Promise<Express.Multer.File> {
    try {
      const size = 390;
      const resizedImageBuffer = await sharp(image.buffer)
        .resize(size, size, {
          fit: 'cover',
        })
        .toBuffer();
      const circleSvg = `<svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white" />
      </svg>`;
      const circleBuffer = Buffer.from(circleSvg);

      const finalImageBuffer = await sharp(resizedImageBuffer)
        .composite([{ input: circleBuffer, blend: 'dest-in' }])
        .png()
        .toBuffer();

      const transformedImage: Express.Multer.File = {
        ...image,
        buffer: finalImageBuffer,
      };

      return transformedImage;
    } catch (error) {
      console.error('Помилка під час обробки зображень:', error);
      throw new BadRequestException('Помилка під час обробки зображень');
    }
  }
}
