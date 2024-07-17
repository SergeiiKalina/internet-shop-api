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
  'EU 36',
  'EU 37',
  'EU 38',
  'EU 39',
  'EU 40',
  'EU 41',
  'EU 42',
  'EU 43',
  'EU 44',
  'EU 45',
] as const;
export const sex = ['unsex', 'male', 'female'] as const;
