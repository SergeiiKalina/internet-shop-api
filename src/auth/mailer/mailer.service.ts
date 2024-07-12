require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/auth/user.model';

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
  public orderGood(to: string, user: User) {
    this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        context: {
          userName: user.firstName,
        },
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
