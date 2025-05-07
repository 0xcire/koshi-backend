import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { randomUUID } from 'node:crypto';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'verifications' })
export class Verification extends BaseEntity {
  @PrimaryKey({
    type: 'string',
    comment: 'Primary key for the verification record',
  })
  id: string = randomUUID();

  @Property({
    type: 'string',
    comment: 'Identifier for the verification (e.g., email or user ID)',
  })
  identifier!: string;

  @Property({ type: 'string', comment: 'Verification token or code' })
  value!: string;

  @Property({
    type: 'date',
    comment: 'Expiration timestamp for the verification token',
  })
  expiresAt!: Date;
}
