import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Expose, Transform } from 'class-transformer';

/*
 * NOTE: class to define subset of nrel data needed for e85 station data
 * there are many fuel station types, and even if you only query a subset
 * unfortunately irrelevent data for excluded station types will be returned as null.
 * I will never touch these fields, at least for now so,
 * using below to easily filter out all undesired fields via
 * plaintoClass(StationFromNrel, obj, { excludeExtraneousValues: true }) (requires @Expose)
 * */
@Entity({ tableName: 'stations' })
export class Station {
  @PrimaryKey({
    autoincrement: false,
    type: 'integer',
    comment: 'Numerical ID from NREL dataset',
    nullable: false,
  })
  @Expose()
  id!: number;

  @Property({
    type: 'varchar',
    comment: 'Public or private',
    nullable: false,
    persist: true,
  })
  @Expose({ name: 'access_code' })
  accessCode!: string;

  @Property({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment:
      'format: 24 hours daily || 6am-11pm M-Sat, 7am-11pm Sun || 6am-10pm daily',
  })
  @Expose({ name: 'access_days_time' })
  accessDaysTime!: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: 'code denoting access. mapped in application',
  })
  @Expose({ name: 'access_detail_code' })
  accessDetailCode?: string;

  @Property({
    type: 'varchar',
    length: 255,
    nullable: true,
    comment:
      'Space separated list of accepted payment types. Mapped in application',
  })
  @Expose({ name: 'cards_accepted' })
  cardsAccepted?: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: "The date the station's details were last confirmed.",
  })
  @Expose({ name: 'date_last_confirmed' })
  @Transform(({ value }) => value && new Date(value))
  dateLastConfirmed?: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: 'Planned opening date or re-opening for closed stations',
  })
  @Expose({ name: 'expected_date' })
  @Transform(({ value }) => value && new Date(value))
  expectedDate?: string;

  @Property({
    type: 'varchar',
    length: 8,
    nullable: false,
    comment: "Station fuel type. Here, only 'E85'",
  })
  @Expose({ name: 'fuel_type_code' })
  fuelTypeCode!: string;

  @Property({
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'maximum vehicle class size that can access station',
  })
  @Expose({ name: 'maximum_vehicle_class' })
  maximumVehicleClass?: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: 'Station open date',
  })
  @Expose({ name: 'open_date' })
  @Transform(({ value }) => value && new Date(value))
  openDate?: string;

  @Property({
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'station ownership type. mapped in application',
  })
  @Expose({ name: 'owner_type_code' })
  ownerTypeCode?: string;

  @Property({
    type: 'boolean',
    nullable: false,
    comment:
      'For public stations, an indication of whether the station has restricted access',
  })
  @Expose({ name: 'restricted_access' })
  restrictedAccess!: boolean;

  @Property({
    type: 'varchar',
    length: 1,
    nullable: false,
    comment: 'current status of station. mapped in application',
  })
  @Expose({ name: 'status_code' })
  statusCode!: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment:
      'The type of facility at which the station is located, given as code values and mapped in app',
  })
  @Expose({ name: 'facility_type' })
  facilityType?: string;

  @Property({
    type: 'varchar',
    nullable: false,
    comment: 'Name of station',
  })
  @Expose({ name: 'station_name' })
  stationName!: string;

  @Property({
    type: 'varchar',
    length: 32,
    nullable: true,
    comment: 'Name of station',
  })
  @Expose({ name: 'station_phone' })
  stationPhone?: string;

  @Property({
    type: 'timestamptz',
    nullable: false,
    comment: 'When station details were last updated',
  })
  @Expose({ name: 'updated_at' })
  @Transform(({ value }) => value && new Date(value))
  updatedAt!: Date;

  @Property({
    type: 'varchar',
    length: 5,
    nullable: false,
    comment: 'rating indicating accuracy of lat/lon coordinates. mapped in app',
  })
  @Expose({ name: 'geocode_status' })
  geocodeStatus!: string;

  @Property({
    type: 'real',
    nullable: false,
    comment: 'latitude coordinate point',
  })
  @Expose()
  latitude!: number;

  @Property({
    type: 'real',
    nullable: false,
    comment: 'latitude coordinate point',
  })
  @Expose()
  longitude!: number;

  @Property({
    type: 'varchar',
    length: 255,
    nullable: false,
    comment: 'City of station',
  })
  @Expose()
  city!: string;

  @Property({
    type: 'varchar',
    length: 2,
    nullable: false,
    comment: 'State of station',
  })
  @Expose()
  state!: string;

  @Property({
    type: 'varchar',
    length: 2,
    nullable: false,
    comment: 'Country of station',
  })
  @Expose()
  country!: string;

  @Property({
    type: 'varchar',
    nullable: false,
    comment: "The street address of the station's location.",
  })
  @Expose({ name: 'street_address' })
  streetAddress!: string;

  @Property({
    type: 'varchar',
    length: 5,
    nullable: false,
    comment: 'zipcode',
  })
  @Expose()
  zip?: string;

  @Property({
    type: 'varchar',
    length: 4,
    nullable: true,
    comment: 'plus 4 of zipcode. US only',
  })
  @Expose()
  plus4?: string;

  @Property({
    type: 'varchar',
    nullable: true,
    length: 510,
    comment: 'Brief additional information about how to locate the station',
  })
  @Expose({ name: 'intersection_directions' })
  intersectionDirections?: string;

  @Property({
    type: 'boolean',
    nullable: false,
    comment:
      'For E85 stations, an indication of whether the station has a blender pump on site',
  })
  @Expose({ name: 'e85_blender_pump' })
  e85BlenderPump!: boolean;

  @Property({
    type: 'array',
    nullable: true,
    comment:
      'For E85 stations, an array of strings identifying the range(s) of blends other than E85 available',
  })
  @Expose({ name: 'e85_other_ethanol_blends' })
  e85OtherEthanolBlends?: string[];
}
