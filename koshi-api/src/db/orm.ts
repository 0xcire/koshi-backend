import { MikroORM } from '@mikro-orm/core';
import { baseCfg } from './mikro-orm.config';
import { BaseEntity, User, Account, Verification } from './entities/';

// for use w/ current impl of better-auth
export const ormSync = MikroORM.initSync({
  ...baseCfg,
  entities: [BaseEntity, User, Account, Verification], // initSync does not support folder discovery
});
