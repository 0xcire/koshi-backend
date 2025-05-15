import { Entity, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';

@Entity({ tableName: 'stations' })
export class Station extends BaseEntity {
  @Property({
    type: 'varchar',
    fieldName: 'access_code',
    comment: 'Denotes public availability of given station',
  })
  accessCode!: string;
}
