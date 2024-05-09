import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageService {
  constructor() {}

  async uploadPhoto(file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new Error('Invalid file provided. Please upload a valid image.');
    }
    const formData = new FormData();
    formData.append(
      'image',
      new Blob([file.buffer], { type: file.mimetype }),
      Date.now() + '-' + Math.round(Math.random() * 1e9),
    );

    try {
      const response = await axios.post(
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

      return response.data;
    } catch (error) {
      throw new Error('Failed to upload photo');
    }
  }
}
