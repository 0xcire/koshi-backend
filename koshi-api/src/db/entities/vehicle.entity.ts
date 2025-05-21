import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { randomUUID } from 'node:crypto';
import { User } from './user.entity';

@Entity({ tableName: 'vehicles' })
export class Vehicle extends BaseEntity {
  @PrimaryKey({ type: 'string', comment: 'Primary key for the vehicle' })
  id: string = randomUUID(); // TODO: this does not do anything?

  @Property({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: "Make of user's car",
  })
  make!: string;

  @Property({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: "Model of user's car",
  })
  model!: string;

  @Property({
    type: 'smallint',
    nullable: false,
    comment: 'year car was built',
  })
  year!: number;

  @Property({
    type: 'varchar',
    length: 16,
    nullable: false,
    comment: 'Fuel type for given car. Currently only ethanol',
  })
  fuelType!: string;

  @Property({
    type: 'real',
    nullable: false,
    comment: 'Tank size. Denoted in gallons.',
  })
  fuelTankSize!: number;

  @Property({
    type: 'real',
    nullable: false,
    comment: 'Avg fuel efficiency denoted in mpg',
  })
  appxFuelEfficiency!: number;

  @Property({
    type: 'integer',
    nullable: false,
    comment: 'Current mileage of vehicle',
  })
  mileage!: number;

  @Property({
    type: 'varchar',
    length: 17,
    unique: true,
    nullable: false,
    comment: 'VIN of vehicle.',
  })
  vin!: string;

  @ManyToOne({
    serializer: (val) => val,
    entity: () => User,
    nullable: false,
    deleteRule: 'cascade',
  })
  user!: User;
}
