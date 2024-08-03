import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype } = metadata;
    if (!metatype || !this.isDto(metatype)) {
      return value;
    }

    const dto = plainToClass(metatype, value);

    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(this.formatErrors(errors));
    }

    return value;
  }

  private isDto(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    const formattedErrors = { errors: [] };
    errors.forEach((error) => {
      const { property, constraints } = error;
      formattedErrors.errors.push({
        field: property,
        message: Object.values(constraints),
      });
    });
    return formattedErrors;
  }
}
