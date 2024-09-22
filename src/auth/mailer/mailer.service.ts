require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreatePurchaseDto } from 'src/purchase/dto/create-purchase.dto';
import { Product } from 'src/products/product.model';
import Purchase from 'src/purchase/purchase.model';
import { User } from '../user.model';

@Injectable()
export class Mailer {
  constructor(private readonly mailerService: MailerService) {}

  public sendMail(
    to: string,
    link: string,
    userName: string,
    info: string,
    subject: string,
    textButton: string,
  ): void {
    this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject,
        template: './mail',
        context: {
          userName,
          link,
          info,
          textButton,
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }
  public orderGood(
    to: string,
    user: CreatePurchaseDto,
    salesman: User,
    product: Product,
    purchase: Purchase,
  ) {
    this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject: 'Нове замовлення на DealOk',
        template: './myOrder',
        context: {
          quantity: user.quantity,
          firstName: user.firstName,
          lastName: user.lastName,
          count: product.count,
          data: purchase.createDate,
          status: purchase.status,
          photo: product.minImage,
          sum: product.discount
            ? product.discountPrice * purchase.quantity
            : product.price * purchase.quantity,
          title: product.title,
          price: product.discount ? product.discountPrice : product.price,
          salesmanPhone: salesman.numberPhone,
          tel: user.tel,
          pay: purchase.pay,
          address: purchase.town[0] + ' ' + purchase.postOffice,
          email: user.email ? user.email : 'нема',
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }

  public async sendInfoAboutOrder(
    to: string,
    user: CreatePurchaseDto,
    salesman: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject: 'Нове замовлення на DealOk',
        template: './purchase',
        context: {
          quantity: user.quantity,
          firstName: user.firstName,
          lastName: user.lastName,
          count: product.count,
          data: purchase.createDate,
          status: purchase.status,
          photo: product.minImage,
          sum: product.discount
            ? product.discountPrice * purchase.quantity
            : product.price * purchase.quantity,
          title: product.title,
          price: product.discount ? product.discountPrice : product.price,
          salesmanPhone: salesman.numberPhone,
          tel: user.tel,
          pay: purchase.pay,
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
