require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class Mailer {
  constructor(private readonly mailerService: MailerService) {}

  public sendMail(to: string, link: string): void {
    this.mailerService
      .sendMail({
        to,
        from: process.env.SMTP_USER,
        subject: 'Testing Nest MailerModule ✔',
        text: 'welcome',
        html: `<h2>${link}</h2>`,
      })

      .catch((e) => {
        console.log(e);
      });
  }
}
