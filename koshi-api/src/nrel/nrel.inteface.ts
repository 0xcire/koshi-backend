import { Station } from '@/db/entities';

export interface INrelService {
  syncStations(): Promise<void>;
  getAllUpstreamStations(): Promise<Array<Station>>;
  getLocalLastUpdatedAt(): Promise<Date | undefined>;
  getUpstreamLastUpdatedAt(): Promise<Date>;
}
