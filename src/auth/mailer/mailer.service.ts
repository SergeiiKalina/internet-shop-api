require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { CreatePurchaseDto } from 'src/purchase/dto/create-purchase.dto';
import { Product } from 'src/products/product.model';

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
    productId: string,
    product: Product,
  ) {
    this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject: 'Нове замовлення на DealOk',
        html: `
        <p>Назва товару: ${product.title} </p>
        <p>Айді товару: ${productId} </p>
        <p>Кількість: ${user.quantity}</p>
          <p>Данні замовника:</p>
          <p>Ім'я: ${user.firstName} ${user.lastName}</p>
          <p> ${user.email ? 'Email:' + user.email : ''}</p>
          <p>Телефон: ${user.tel}</p>
          <p>Місто: ${user.town[0]}</p>
          <p>Відділення пошти: ${user.postOffice}</p>
          <p>${user.building ? 'Будівля:' + user.building : ''}</p>
          <p>Спосіб доставки: ${user.wayDelivery}</p>
          <p>Спосіб оплати: ${user.pay}</p>
        `,
      })
      .catch((e) => {
        console.log(e);
      });
  }

  public async sendInfoAboutOrder(
    to: string,
    emailProducer: string,
    numberPhoneProducer: string,
    product: Product,
    quantity: number,
  ) {
    await this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject: 'Нове замовлення на DealOk',
        html: `
          <p>Інформація про замовлення</p>
          <p>Назва товару: ${product.title} </p> <!-- Перевірка правильності виклику -->
          <p>Кількість: ${quantity}</p>
          <p>Інформація про продавця:</p>
          <p>Емаіл: ${emailProducer} </p>
          <p>Номер телефону: ${numberPhoneProducer} </p>
        `,
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
