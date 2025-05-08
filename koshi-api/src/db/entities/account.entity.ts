import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { User } from './user.entity';
import { randomUUID } from 'node:crypto';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'accounts' })
export class Account extends BaseEntity {
  @PrimaryKey({ type: 'string', comment: 'Primary key for the account' })
  id: string = randomUUID();

  @Property({ type: 'string', comment: 'Provider-specific account ID' })
  accountId!: string;

  @Property({
    type: 'string',
    comment: 'Identifier for the provider (e.g., Google, GitHub)',
  })
  providerId!: string;

  @ManyToOne(() => User, {
    fieldName: 'userId',
    referenceColumnName: 'id',
    deleteRule: 'cascade',
    index: true,
    comment: 'Foreign key to user.id',
  })
  userId!: string;

  @Property({ type: 'string', nullable: true, comment: 'OAuth access token' })
  accessToken?: string;

  @Property({ type: 'string', nullable: true, comment: 'OAuth refresh token' })
  refreshToken?: string;

  @Property({
    type: 'string',
    nullable: true,
    comment: 'OAuth ID token for identity verification',
  })
  idToken?: string;

  @Property({
    type: 'date',
    nullable: true,
    comment: 'Expiration timestamp for the access token',
  })
  accessTokenExpiresAt?: Date;

  @Property({
    type: 'date',
    nullable: true,
    comment: 'Expiration timestamp for the refresh token',
  })
  refreshTokenExpiresAt?: Date;

  @Property({
    type: 'string',
    nullable: true,
    comment: 'OAuth scopes granted to the account',
  })
  scope?: string;

  @Property({
    type: 'string',
    nullable: true,
    comment: 'Hashed password for password-based accounts',
  })
  password?: string;
}
