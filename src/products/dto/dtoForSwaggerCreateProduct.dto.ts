import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductSwaggerDto {
  @ApiProperty({ description: 'Title of the product' })
  title: string;

  @ApiProperty({ description: 'Price of the product' })
  price: number;

  @ApiProperty({
    description: 'Flag indicating if the product is eco-friendly',
    default: true,
  })
  eco: boolean;

  @ApiProperty({
    description: 'Flag indicating if the product has a discount',
    default: true,
  })
  discount: boolean;

  @ApiProperty({ description: 'Discount price of the product' })
  discountPrice: number;

  @ApiProperty({
    description: 'Category of the product',
    enum: [
      'Подарункові товари',
      'Вишивка',
      'Аксесуари',
      'Взуття з натуральних матеріалів',
      'Натуральна косметика',
      'Товари з перероблених матеріалів',
      'Подарую+віддам',
    ],
    default: 'Подарункові товари',
  })
  category: string;

  @ApiProperty({
    description: 'Subcategory of the product',
    enum: [
      'Сувеніри',
      'Подарункові набори',
      'Святкова тематика',
      'Сорочки',
      'Плаття',
      'Блузки',
      'Сумки',
      'Пояси',
      'Портмоне',
      'Хустки',
      'Окуляри',
      'Зимове',
      'Літнє',
      'Мило',
      'Парфюмерія',
      'Перероблений денім',
      'Востановленний секонд хэнд',
    ],
    default: 'Сувеніри',
  })
  subCategory: string;

  @ApiProperty({ description: 'State of the product', default: 'Нове' })
  state: string;

  @ApiProperty({ description: 'Size of the product', default: null })
  size: string | null;

  @ApiProperty({ description: 'Description of the product' })
  describe: string;

  @ApiProperty({
    description: 'File of the product',
    type: 'string',
    format: 'binary',
  })
  file: any;
}
