require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class Mailer {
  constructor(private readonly mailerService: MailerService) {}

  public sendMail(
    to: string,
    link: string,
    userName: string,
    info: string,
    footerInfo: { start: string; link: string },
    subject: string,
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
          footerInfoStart: footerInfo.start,
          footerInfoLink: footerInfo.link,
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
