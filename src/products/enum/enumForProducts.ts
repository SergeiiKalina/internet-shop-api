export enum SortField {
  CREATE = 'createDate',
  PRICE = 'price',
  VISIT = 'visit',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export const CategoryEnum = [
  'Подарункові товари',
  'Одяг',
  'Аксесуари',
  'Взуття з натуральних матеріалів',
  'Натуральна косметика',
  'Товари з перероблених матеріалів',
  'Подарую',
] as const;

export const SubCategoryEnum = [
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
  'Вишивка',
  null,
] as const;

export const sizeEmbroidery = [
  'Без розміру',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  'XXXL',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
] as const;

export const sexEnum = ['unsex', 'male', 'female'] as const;
