import { MikroORM, PostgreSqlDriver } from '@mikro-orm/postgresql';
import * as entities from '@/db/entities';
import { defineConfig } from '@mikro-orm/core';

const testCfg = {
  connect: false,
  driver: PostgreSqlDriver,
  clientUrl: 'postgresql://user:pass@localhost/test_db',
  schema: 'test',
  entities: Object.values(entities),
  allowGlobalContext: true,
};

const orm = MikroORM.initSync(defineConfig(testCfg));

export const em = orm.em;
