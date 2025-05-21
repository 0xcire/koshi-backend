import { Migration } from '@mikro-orm/migrations';

export class Migration20250521044643_vehicles extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "vehicles" ("id" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "make" varchar(255) not null, "model" varchar(255) not null, "year" smallint not null, "fuel_type" varchar(16) not null, "fuel_tank_size" real not null, "appx_fuel_efficiency" real not null, "mileage" int not null, "vin" varchar(17) not null, "user_id" varchar(255) not null, constraint "vehicles_pkey" primary key ("id"));`,
    );
    this.addSql(
      `comment on column "vehicles"."id" is 'Primary key for the vehicle';`,
    );
    this.addSql(
      `comment on column "vehicles"."created_at" is 'Timestamp of when the record was created';`,
    );
    this.addSql(
      `comment on column "vehicles"."updated_at" is 'comment: ''Timestamp of the last user record update'',';`,
    );
    this.addSql(
      `comment on column "vehicles"."make" is 'Make of user''s car';`,
    );
    this.addSql(
      `comment on column "vehicles"."model" is 'Model of user''s car';`,
    );
    this.addSql(`comment on column "vehicles"."year" is 'year car was built';`);
    this.addSql(
      `comment on column "vehicles"."fuel_type" is 'Fuel type for given car. Currently only ethanol';`,
    );
    this.addSql(
      `comment on column "vehicles"."fuel_tank_size" is 'Tank size. Denoted in gallons.';`,
    );
    this.addSql(
      `comment on column "vehicles"."appx_fuel_efficiency" is 'Avg fuel efficiency denoted in mpg';`,
    );
    this.addSql(
      `comment on column "vehicles"."mileage" is 'Current mileage of vehicle';`,
    );
    this.addSql(`comment on column "vehicles"."vin" is 'VIN of vehicle.';`);
    this.addSql(
      `alter table "vehicles" add constraint "vehicles_vin_unique" unique ("vin");`,
    );

    this.addSql(
      `alter table "vehicles" add constraint "vehicles_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vehicles" cascade;`);
  }
}
