export const aggregateForFiltersAndSortedProducts = [
  {
    $addFields: {
      categoryId: { $toObjectId: '$category' },
    },
  },
  {
    $lookup: {
      from: 'categories',
      localField: 'categoryId',
      foreignField: '_id',
      as: 'category',
    },
  },
  {
    $unwind: '$category',
  },
  {
    $addFields: {
      subcategoryId: { $toObjectId: '$subCategory' },
    },
  },
  {
    $lookup: {
      from: 'subcategories',
      localField: 'subcategoryId',
      foreignField: '_id',
      as: 'subCategory',
    },
  },
  {
    $unwind: '$subCategory',
  },
  {
    $addFields: {
      producerId: { $toObjectId: '$producer' },
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'producer',
      foreignField: '_id',
      as: 'producer',
    },
  },
  {
    $unwind: '$producer',
  },
  {
    $unset: 'producer.password',
  },
  {
    $unset: 'producer.isActivated',
  },
  {
    $unset: 'producer.activationLink',
  },
  {
    $unset: 'producer.lastLogout',
  },
  {
    $unset: 'producer.favorites',
  },
  {
    $unset: 'producer.purchasedGoods',
  },
  {
    $unset: 'producer.soldGoods',
  },
  {
    $unset: 'producer.registrationDate',
  },
  {
    $project: {
      title: 1,
      price: 1,
      discount: 1,
      discountPrice: 1,
      visit: 1,
      category: '$category.mainCategory',
      subCategory: '$subCategory.subCategory',
      producer: '$producer',
      img: 1,
      describe: 1,
      parameters: 1,
      createDate: 1,
      comments: 1,
      __v: 1,
      minImage: 1,
    },
  },
];
