export const addEffectivePrice = [
  {
    $addFields: {
      effectivePrice: {
        $cond: {
          if: { $eq: ['$discount', true] },
          then: '$discountPrice',
          else: '$price',
        },
      },
    },
  },

  {
    $project: {
      title: 1,
      price: 1,
      discount: 1,
      discountPrice: 1,
      visit: 1,
      category: 1,
      subCategory: 1,
      producer: 1,
      img: 1,
      describe: 1,
      parameters: 1,
      createDate: 1,
      comments: 1,
      __v: 1,
      minImage: 1,
      effectivePrice: 1,
      status: 1,
    },
  },
];

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
      subcategoryId: {
        $cond: {
          if: {
            $and: [
              { $ne: ['$subCategory', null] },
              { $eq: [{ $strLenBytes: '$subCategory' }, 24] },
            ],
          },
          then: { $toObjectId: '$subCategory' },
          else: null,
        },
      },
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
      category: 1,
      subCategory: 1,
      producer: 1,
      img: 1,
      describe: 1,
      parameters: 1,
      createDate: 1,
      comments: 1,
      __v: 1,
      minImage: 1,
      effectivePrice: 1,
      status: 1,
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
    $group: {
      _id: '$_id',
      title: { $first: '$title' },
      category: { $first: '$category.mainCategory' },
      subCategory: { $first: '$subCategory' },
      parameters: { $first: '$parameters' },
      price: { $first: '$price' },
      discount: { $first: '$discount' },
      discountPrice: { $first: '$discountPrice' },
    },
  },
];
