export enum NrelEndpoints {
  'Stations' = '/api/alt-fuel-stations/v1',
  'LastUpdated' = '/api/alt-fuel-stations/v1/last-updated',
  'Nearest' = '/api/alt-fuel-stations/v1/nearest',
  'NearbyRoute' = '/api/alt-fuel-stations/v1/nearby-route', // this will likely be done myself
}

export enum ResponseFormat {
  Json = 'json',
}

export enum FuelType {
  E85 = 'E85',
}

export enum Access {
  'Public' = 'public',
}
export interface GetAllStationsResponse {
  station_locator_url: string;
  total_results: number;
  station_counts: {
    total: number;
    fuels: {
      [key: string]: Record<string, number>;
    };
  };
  fuel_stations: Array<Record<string, unknown>>; // we don't care about specific type when reading fuel_stations during map
}

export interface GetLastUpdatedResponse {
  last_updated: string;
}

export enum NrelLog {
  'NoLocalSync' = 'No local sync run detected. Initiating sync process.',
  'WriteToCache' = 'Writing stations to cache',
  'UpstreamAhead' = 'Upstream changes detected. Initiating sync process.',
  'NoUpstream' = 'No upstream changes detected. Ignoring sync process.',
  'CacheHit' = 'Cache Hit - Stations',
  'CacheMiss' = 'Cache Miss - Stations',
}
