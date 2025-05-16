import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'sync_run' })
export class SyncRun {
  @PrimaryKey({
    autoincrement: true,
  })
  id!: number;

  @Property({
    type: 'timestamptz',
    index: true,
    nullable: false,
    comment: 'timestamp for most recent sync run from nrel to local db',
  })
  lastUpdatedAt!: Date;
}
