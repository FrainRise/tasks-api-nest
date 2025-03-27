import { ConfigService } from '@nestjs/config';
import { ConfigType } from './types.config';

export class TypedConfigService extends ConfigService<ConfigType> {}
