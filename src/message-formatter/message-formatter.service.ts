import * as moment from 'moment';

export class MessageFormatterService {
  format(message: string): string {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    return `[${timestamp}] ${message}`;
  }
}
