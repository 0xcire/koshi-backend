import { DeepPartial } from 'better-auth/*';
import { IConfig } from './types';
import { IS_PROD } from '@/types';

export const config = (): DeepPartial<IConfig> => {
  return {
    port: parseInt(process.env.PORT as string, 10) || 1338,
    koshi: {
      clientUrl: process.env.KOSHI_CLIENT_URL,
      apiUrl: process.env.KOSHI_API_URL,
    },
    smtp: {
      host: process.env.SMTP_HOST,
      secure: IS_PROD,
      port: parseInt(process.env.SMTP_PORT as string, 10),
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS,
      },
    },
    email: {
      senderAddress: process.env.SENDER_ADDRESS,
    },
    secret: {
      betterAuth: process.env.BETTER_AUTH_SECRET,
    },
    postgres: {
      connectionString: process.env.PG_URL,
    },
    redis: {
      host: process.env.REDIS_HOST,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      port: parseInt(process.env.PORT as string, 10) || 6379,
    },
    nrel: {
      apiKey: process.env.NREL_KEY,
      baseUrl: process.env.NREL_BASE_URl,
    },
  };
};

// app only runs when ^config is validated in main.ts
export const configInstance = config() as IConfig;
