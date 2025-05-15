import { Station } from './types';

export interface INrelService {
  syncStations(): Promise<void>;
  //getAllStations(): Promise<Array<Station>>; // TODO: change return type
  //getLastUpdatedDate(): Promise<Date>;
}
