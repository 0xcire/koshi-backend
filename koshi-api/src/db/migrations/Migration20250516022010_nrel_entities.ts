import { Migration } from '@mikro-orm/migrations';

export class Migration20250516022010_nrel_entities extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "stations" ("id" int not null, "access_code" varchar(255) not null, "access_days_time" varchar(255) not null, "access_detail_code" varchar(32) null, "cards_accepted" varchar(255) null, "date_last_confirmed" varchar(32) null, "expected_date" varchar(32) null, "fuel_type_code" varchar(8) not null, "maximum_vehicle_class" varchar(2) null, "open_date" varchar(32) null, "owner_type_code" varchar(2) null, "restricted_access" boolean not null, "status_code" varchar(1) not null, "facility_type" varchar(32) null, "station_name" varchar(255) not null, "station_phone" varchar(32) null, "updated_at" timestamptz not null, "geocode_status" varchar(5) not null, "latitude" real not null, "longitude" real not null, "city" varchar(255) not null, "state" varchar(2) not null, "country" varchar(2) not null, "street_address" varchar(255) not null, "zip" varchar(5) not null, "plus4" varchar(4) null, "intersection_directions" varchar(510) null, "e85blender_pump" boolean not null, "e85other_ethanol_blends" text[] null, constraint "stations_pkey" primary key ("id"));`);
    this.addSql(`comment on column "stations"."id" is 'Numerical ID from NREL dataset';`);
    this.addSql(`comment on column "stations"."access_code" is 'Public or private';`);
    this.addSql(`comment on column "stations"."access_days_time" is 'format: 24 hours daily || 6am-11pm M-Sat, 7am-11pm Sun || 6am-10pm daily';`);
    this.addSql(`comment on column "stations"."access_detail_code" is 'code denoting access. mapped in application';`);
    this.addSql(`comment on column "stations"."cards_accepted" is 'Space separated list of accepted payment types. Mapped in application';`);
    this.addSql(`comment on column "stations"."date_last_confirmed" is 'The date the station''s details were last confirmed.';`);
    this.addSql(`comment on column "stations"."expected_date" is 'Planned opening date or re-opening for closed stations';`);
    this.addSql(`comment on column "stations"."fuel_type_code" is 'Station fuel type. Here, only ''E85''';`);
    this.addSql(`comment on column "stations"."maximum_vehicle_class" is 'maximum vehicle class size that can access station';`);
    this.addSql(`comment on column "stations"."open_date" is 'Station open date';`);
    this.addSql(`comment on column "stations"."owner_type_code" is 'station ownership type. mapped in application';`);
    this.addSql(`comment on column "stations"."restricted_access" is 'For public stations, an indication of whether the station has restricted access';`);
    this.addSql(`comment on column "stations"."status_code" is 'current status of station. mapped in application';`);
    this.addSql(`comment on column "stations"."facility_type" is 'The type of facility at which the station is located, given as code values and mapped in app';`);
    this.addSql(`comment on column "stations"."station_name" is 'Name of station';`);
    this.addSql(`comment on column "stations"."station_phone" is 'Name of station';`);
    this.addSql(`comment on column "stations"."updated_at" is 'When station details were last updated';`);
    this.addSql(`comment on column "stations"."geocode_status" is 'rating indicating accuracy of lat/lon coordinates. mapped in app';`);
    this.addSql(`comment on column "stations"."latitude" is 'latitude coordinate point';`);
    this.addSql(`comment on column "stations"."longitude" is 'latitude coordinate point';`);
    this.addSql(`comment on column "stations"."city" is 'City of station';`);
    this.addSql(`comment on column "stations"."state" is 'State of station';`);
    this.addSql(`comment on column "stations"."country" is 'Country of station';`);
    this.addSql(`comment on column "stations"."street_address" is 'The street address of the station''s location.';`);
    this.addSql(`comment on column "stations"."zip" is 'zipcode';`);
    this.addSql(`comment on column "stations"."plus4" is 'plus 4 of zipcode. US only';`);
    this.addSql(`comment on column "stations"."intersection_directions" is 'Brief additional information about how to locate the station';`);
    this.addSql(`comment on column "stations"."e85blender_pump" is 'For E85 stations, an indication of whether the station has a blender pump on site';`);
    this.addSql(`comment on column "stations"."e85other_ethanol_blends" is 'For E85 stations, an array of strings identifying the range(s) of blends other than E85 available';`);

    this.addSql(`create table "sync_run" ("id" serial primary key, "last_updated_at" timestamptz not null);`);
    this.addSql(`comment on column "sync_run"."last_updated_at" is 'timestamp for most recent sync run from nrel to local db';`);
    this.addSql(`create index "sync_run_last_updated_at_index" on "sync_run" ("last_updated_at");`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "stations" cascade;`);

    this.addSql(`drop table if exists "sync_run" cascade;`);
  }

}
