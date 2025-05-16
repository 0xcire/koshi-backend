import { Station } from '@/db/entities';

export interface INrelService {
  syncStations(): Promise<void>;
  getAllStations(): Promise<Station[]>;
  getAllUpstreamStations(): Promise<Station[]>;
  getLocalLastUpdatedAt(): Promise<Date | undefined>;
  getUpstreamLastUpdatedAt(): Promise<Date>;
}
