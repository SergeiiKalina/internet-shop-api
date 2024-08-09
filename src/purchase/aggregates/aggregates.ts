export const aggregateForAllPurchases = [
  {
    $addFields: {
      productId: { $toObjectId: '$product' },
    },
  },
  {
    $lookup: {
      from: 'products',
      localField: 'productId',
      foreignField: '_id',
      as: 'product',
    },
  },
  {
    $unwind: '$product',
  },
  {
    $addFields: {
      categoryId: {
        $toObjectId: '$product.category',
      },
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
  { $unwind: '$category' },
  {
    $addFields: {
      subCategoryId: {
        $toObjectId: '$product.subCategory',
      },
    },
  },
  {
    $lookup: {
      from: 'subcategories',
      localField: 'subCategoryId',
      foreignField: '_id',
      as: 'subCategory',
    },
  },
  { $unwind: '$subCategory' },

  {
    $project: {
      _id: 1,
      status: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      town: 1,
      postOffice: 1,
      tel: 1,
      wayDelivery: 1,
      pay: 1,
      building: 1,
      createDate: 1,
      producer: 1,
      quantity: 1,
      'product._id': 1,
      'product.title': 1,
      'product.price': 1,
      'product.discount': 1,
      'product.discountPrice': 1,
      'product.img': 1,
      'product.minImage': 1,
      'product.category': '$category.mainCategory',
      'product.subCategory': '$subCategory.subCategory',
    },
  },
];
