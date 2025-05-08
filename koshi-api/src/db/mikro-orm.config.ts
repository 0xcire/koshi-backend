import { configInstance } from '@/common/config';
import { Migrator } from '@mikro-orm/migrations';
import { defineConfig, PostgreSqlDriver } from '@mikro-orm/postgresql';
import { PostgreSqlOptions } from '@mikro-orm/postgresql/PostgreSqlMikroORM';
import { NodeEnvironment } from '../types';
import * as entities from './entities/';

export const baseCfg: PostgreSqlOptions = {
  driver: PostgreSqlDriver,
  clientUrl: configInstance.postgres.connectionString,
  ...(process.env.NODE_ENV === NodeEnvironment.Dev && {
    logger: (msg) => console.log('[MikroORM]', msg),
    verbose: true,
    debug: true,
  }),
};

export const cfg: PostgreSqlOptions = {
  ...baseCfg,
  baseDir: process.cwd(),
  entities: Object.values(entities),
  extensions: [Migrator],
  migrations: {
    pathTs: './src/db/migrations',
    path: './dist/src/db/migrations',
    transactional: true,
  },
};

const mikroConfig = defineConfig(cfg);

export default mikroConfig;
