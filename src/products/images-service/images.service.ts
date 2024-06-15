import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageService {
  constructor() {}

  async uploadPhoto(files: Express.Multer.File) {
    try {
      if (!files || !files.buffer) {
        throw new Error(
          'Ви завантажине не картинки, завантажте будьласка картинку',
        );
      }

      const formData = new FormData();
      formData.append(
        'image',
        new Blob([files.buffer], { type: files.mimetype }),
        Date.now() + '-' + Math.round(Math.random() * 1e9),
      );
      const { data } = await axios.post(
        'https://api.imgbb.com/1/upload',
        formData,
        {
          params: {
            key: '401f89dfe6ab448e7a936805f8cc22af',
          },
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      if (!data) {
        throw new BadRequestException(
          'Щось сталось не так з завантаженням кртинки',
        );
      }

      return data.data.url;
    } catch (error) {
      throw new Error('Помилка завантаження картинок');
    }
  }

  async uploadPhotos(files: Express.Multer.File[]) {
    try {
      const arrayLinkImages = [];
      for (let i = 0; i < files.length; i++) {
        if (!files || !files[i].buffer) {
          throw new Error(
            'Ви завантажине не картинки, завантажте будьласка картинку',
          );
        }

        const formData = new FormData();
        formData.append(
          'image',
          new Blob([files[i].buffer], { type: files[i].mimetype }),
          Date.now() + '-' + Math.round(Math.random() * 1e9),
        );
        const { data } = await axios.post(
          'https://api.imgbb.com/1/upload',
          formData,
          {
            params: {
              key: '401f89dfe6ab448e7a936805f8cc22af',
            },
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );

        if (!data) {
          throw new BadRequestException(
            'Щось сталось не так з завантаженням кртинки',
          );
        }
        arrayLinkImages.push(data.data.url);
      }

      return arrayLinkImages;
    } catch (error) {
      throw new Error('Помилка завантаження картинок');
    }
  }
}
