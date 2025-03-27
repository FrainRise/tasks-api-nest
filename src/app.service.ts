import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';
import { AppConfig } from './config/app.config';
import { TypedConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: TypedConfigService,
  ) {}

  getHello(message: string): string {
    const prefix = this.configService.get<AppConfig>('app')?.messagePrefix;
    this.logger.log(`${prefix} ${message}`);
    return message;
  }
}
