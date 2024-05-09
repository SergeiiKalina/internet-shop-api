require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class Mailer {
  constructor(private readonly mailerService: MailerService) {}

  public sendMailActivate(to: string, link: string): void {
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

  public sendMailForgotPassword(
    to: string,
    link: string,
    userName: string,
  ): void {
    this.mailerService
      .sendMail({
        to,
        from: 'Marketplace',
        subject: 'Testing Nest MailerModule ✔',
        text: 'Forgot password',
        html: `<h1>Hello ${userName}</h1>
      <p>Please click this <a href=${link} ><h3>Link</h3></a> that change password</p>`,
      })
      .catch((e) => {
        console.log(e);
      });
  }
}
