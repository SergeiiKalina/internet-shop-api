import { Injectable } from '@nestjs/common';

@Injectable()
export class DateService {
  getFormattedCreateDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Kiev',
    };

    return new Intl.DateTimeFormat('en-GB', options).format(date);
  }
}
