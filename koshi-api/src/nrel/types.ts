export enum NrelEndpoints {
  'Stations' = '/api/alt-fuel-stations/v1',
  'LastUpdated' = '/api/alt-fuel-stations/v1/last-updated',
  'Nearest' = '/api/alt-fuel-stations/v1/nearest',
  'NearbyRoute' = '/api/alt-fuel-stations/v1/nearby-route', // this will likely be done myself
}

export interface Station {
  access_code: 'public' | 'private';
  access_days_time: string;
  access_detail_code?:
    | 'CALL'
    | 'KEY_AFTER_HOURS'
    | 'KEY_ALWAYS'
    | 'CREDIT_CARD_AFTER_HOURS'
    | 'CREDIT_CARD_ALWAYS'
    | 'FLEET'
    | 'GOVERNMENT'
    | 'LIMITED_HOURS'
    | 'RESIDENTIAL';
  cards_accepted: string;
  date_last_confirmed: string;
  expected_date: any;
  fuel_type_code: 'BD' | 'CNG' | 'ELEC' | 'E85' | 'HY' | 'LNG' | 'LPG' | 'RD';
  groups_with_access_code: string;
  id: number;
  maximum_vehicle_class: string;
  open_date: string;
  owner_type_code: string;
  restricted_access: boolean;
  status_code: 'E' | 'P' | 'T';
  funding_sources: any;
  facility_type: string;
  station_name: string;
  station_phone: string;
  updated_at: string;
  geocode_status: string;
  latitude: number;
  longitude: number;
  city: string;
  country: 'US' | 'CA';
  intersection_directions: string;
  plus4: any;
  state: string;
  street_address: string;
  zip: string;
  bd_blends: any;
  cng_dispenser_num: any;
  cng_fill_type_code: any;
  cng_has_rng: any;
  cng_psi: any;
  cng_renewable_source: any;
  cng_total_compression: any;
  cng_total_storage: any;
  cng_vehicle_class: any;
  e85_blender_pump: boolean;
  e85_other_ethanol_blends: string[];
  ev_connector_types: any;
  ev_dc_fast_num: any;
  ev_level1_evse_num: any;
  ev_level2_evse_num: any;
  ev_network: any;
  ev_network_web: any;
  ev_other_evse: any;
  ev_pricing: any;
  ev_renewable_source: any;
  ev_workplace_charging: any;
  hy_is_retail: any;
  hy_pressures: any;
  hy_standards: any;
  hy_status_link: any;
  lng_has_rng: any;
  lng_renewable_source: any;
  lng_vehicle_class: any;
  lpg_nozzle_types: any;
  lpg_primary: any;
  ng_fill_type_code?: string;
  ng_psi?: string;
  ng_vehicle_class?: string;
  rd_blended_with_biodiesel?: string;
  rd_blends?: string;
  rd_blends_fr?: string;
  rd_max_biodiesel_level?: string;
  nps_unit_name?: string;
  access_days_time_fr?: string;
  intersection_directions_fr?: string;
  bd_blends_fr?: string;
  groups_with_access_code_fr?: string;
  ev_pricing_fr?: string;
}
