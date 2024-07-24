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
    $unwind: {
      path: '$subCategory',
      preserveNullAndEmptyArrays: true,
    },
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
    $unset: [
      'producer.password',
      'producer.isActivated',
      'producer.activationLink',
      'producer.lastLogout',
      'producer.favorites',
      'producer.purchasedGoods',
      'producer.soldGoods',
      'producer.registrationDate',
    ],
  },

  {
    $project: {
      title: 1,
      price: 1,
      discount: 1,
      discountPrice: 1,
      visit: 1,
      category: '$category.mainCategory',
      subCategory: {
        $ifNull: ['$subCategory.subCategory', 'No Subcategory'], // Заменяем null на дефолтное значение
      },
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

export const aggregateForAllProductsInThisCategory = [
  {
    $lookup: {
      from: 'colors',
      localField: 'parameters.color',
      foreignField: '_id',
      as: 'parameters.color',
    },
  },
  {
    $unwind: {
      path: '$parameters.color',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: '$_id',
      title: { $first: '$title' },
      category: { $first: '$category' },
      subCategory: { $first: '$subCategory' },
      parameters: { $first: '$parameters' },
      price: { $first: '$price' },
      discount: { $first: '$discount' },
      discountPrice: { $first: '$discountPrice' },
    },
  },
];
