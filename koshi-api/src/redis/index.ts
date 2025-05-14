import { configInstance } from '@/common/config';
import { IS_PROD } from '@/types';
import { Redis } from 'ioredis';

// for use with better-auth
// NOTE: fix connect logic
export const redis = new Redis({
  host: configInstance.redis.host,
  //username: configInstance.redis.username,
  //password: configInstance.redis.password,
  port: configInstance.redis.port,

  enableOfflineQueue: false,
  showFriendlyErrorStack: !IS_PROD,
  autoResubscribe: false,
  maxRetriesPerRequest: 1,
  connectTimeout: 10000,
});
