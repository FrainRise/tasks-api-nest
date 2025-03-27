import { registerAs } from '@nestjs/config';

export interface AppConfig {
  messagePrefix: string;
}

export const appConfig = registerAs('app', () => ({
  messagePrefix: process.env.APP_MESSAGE_PREFIX,
}));
