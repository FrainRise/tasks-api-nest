import { Injectable } from '@nestjs/common';

import { MessageFormatterService } from 'src/message-formatter/message-formatter.service';

@Injectable()
export class LoggerService {
  constructor(private readonly messageFormatter: MessageFormatterService) {}

  log(message: string) {
    console.log(this.messageFormatter.format(message));
  }
}
