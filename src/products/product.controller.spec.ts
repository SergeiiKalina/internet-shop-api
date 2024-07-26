import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ImageService } from './images-service/images.service';
import { CategoryService } from '../category/category.service';
import { ColorService } from '../color/color.service';
import { TransformImageService } from './images-service/transform-image.sevice';
import { ProductFilterService } from './filter/filter.service';
import { Product } from './product.model';
import { getModelToken } from '@nestjs/mongoose';
import { Category } from '../category/categoty.model';
import { SubCategory } from '../category/subCategory.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CommentService } from '../comment/comment.service';

describe('ProfuctController', () => {
  let productController: ProductsController;
  let productSevice: ProductsService;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: {
            _id: '6645c3dc3fc9f80364c650cf',
            title: 'Шкатулка для прикрас',
            price: 1200,
            discount: false,
            discountPrice: 0,
            visit: 103,
            category: '66486d84bd0ee0adbd7bba3c',
            producer: '662c019b7b02e623f5c5fb45',
            subCategory: '66486d84bd0ee0adbd7bba3e',
            img: ['https://i.ibb.co/8gZp9wn/1718565098144-690586531.png'],
            describe:
              'Шкатулка для прикрас - це чудовий аксесуар, який допоможе зберегти ваш…',
            parameters: {
              color: [
                '664f1096c45fcb487f9de42c',
                '664f10b0c45fcb487f9de42f',
                '664f1181c45fcb487f9de444',
              ],
              size: ['Без розміру'],
              state: 'Нове',
              brand: '',
              eco: true,
              isUkraine: true,
              _id: '6645c3dc3fc9f80364c650d0',
              sex: 'unsex',
            },
            createDate: '2024-05-16T08:29:16.458+00:00',
            comments: [
              '667ab0088db2f3776134e752',
              '667ab0d3ac62a20e8e68a684',
              '667ab3567b42f3cacb6a4ccc',
              '667ab96f81ad22c6f8d866dc',
              '667ab9f9f70c8e23c5734dfc',
              '667aba67e651775a74f3b01c',
              '667abad3272e8f4cb85f007a',
              '667abaf8c913516b57272f18',
              '667abb1e0778d9c68cf92609',
              '667abb7db62b62e114e99590',
            ],
            minImage: 'https://i.ibb.co/w41Qk7R/1718958037058-107506516.png',
          },
        },
        {
          provide: getModelToken(Category.name),
          useValue: {
            _id: '66486d84bd0ee0adbd7bba3c',
            mainCategory: { en: 'gift', ua: 'Подарункові товари' },

            subCategory: [
              '66486d84bd0ee0adbd7bba3e',
              '66486d84bd0ee0adbd7bba41',
              '66486d84bd0ee0adbd7bba44',
            ],

            img: 'https://i.ibb.co/8jSgp8Y/1716041033325-861622247.png',
          },
        },
        {
          provide: getModelToken(SubCategory.name),
          useValue: {
            _id: '66486d84bd0ee0adbd7bba3e',
            mainCategory: '66486d84bd0ee0adbd7bba3c',

            subCategory: { en: 'souvenirs', ua: 'Сувеніри' },
            img: 'https://i.ibb.co/XD8HSQB/1716041472606-617570414.png',
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {},
        },
        {
          provide: ImageService,
          useValue: {},
        },
        {
          provide: CommentService,
          useValue: {},
        },
        {
          provide: ProductFilterService,
          useValue: {},
        },
        {
          provide: CategoryService,
          useValue: {},
        },
        {
          provide: ColorService,
          useValue: {},
        },
        {
          provide: TransformImageService,
          useValue: {}, // Моковий TransformImageService
        },
      ],
    }).compile();
    productSevice = testingModule.get<ProductsService>(ProductsService);
    productController =
      testingModule.get<ProductsController>(ProductsController);
  });

  it('should return products with correct pagination', async () => {
    const result = {
      products: [], // Поверніть продукти, які ви хочете протестувати
      totalItems: 50,
      filters: {},
    };

    jest
      .spyOn(productSevice, 'getAllProducts')
      .mockImplementation(async (page, limit) => result);

    const page = 2;
    const limit = 10;
    const response = await productController.getAllProducts(page, limit);

    // Перевірте, що метод сервісу викликаний з правильними параметрами
    expect(productSevice.getAllProducts).toHaveBeenCalledWith(page, limit);

    // Перевірте обчислену кількість сторінок
    expect(response.totalPages).toBe(Math.ceil(result.totalItems / limit));

    // Перевірте повернутий результат
    expect(response.products).toEqual(result.products);
    expect(response.totalItems).toBe(result.totalItems);
    expect(response.filters).toEqual(result.filters);
  });

  it('should handle default values correctly', async () => {
    const result = {
      products: [], // Поверніть продукти, які ви хочете протестувати
      totalItems: 10,
      filters: {},
    };

    jest
      .spyOn(productSevice, 'getAllProducts')
      .mockImplementation(async (page, limit) => result);

    const response = await productController.getAllProducts();

    // Перевірте, що метод сервісу викликаний з правильними параметрами за замовчуванням
    expect(productSevice.getAllProducts).toHaveBeenCalledWith(1, 20);

    // Перевірте обчислену кількість сторінок
    expect(response.totalPages).toBe(Math.ceil(result.totalItems / 20));

    // Перевірте повернутий результат
    expect(response.products).toEqual(result.products);
    expect(response.totalItems).toBe(result.totalItems);
    expect(response.filters).toEqual(result.filters);
  });
});
