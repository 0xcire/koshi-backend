import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { IConfig } from '@/common/config/types';
import { INrelService } from './nrel.inteface';
import { NrelEndpoints, Station } from './types';

/*
 *  Service to handle sync between local db and nrel db for e85 fuel stations - cut down api requests
 *  Runs update check every week and acts accordingly
 *  provides fuel station data for display on map and routing
 *  TODO: sync should eventually be worked off w/ mq
 * */
@Injectable()
export class NrelService implements INrelService {
  private readonly logger = new Logger(NrelService.name);
  private readonly baseUrl;

  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get('nrel.baseUrl', { infer: true });
  }

  @Cron('0 * * * * *')
  testCron() {
    this.logger.log('testing');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async syncStations(): Promise<void> {
    // get local_last_updated
    const localLastUpdatedAt = new Date();
    // get nrel_last_updated
    const upstreamLastUpdatedAt = new Date();
    // if nrel is ahead
    if (!this.upstreamIsAhead(localLastUpdatedAt, upstreamLastUpdatedAt))
      return;
    // get all stations and sync to db
  }

  async getAllUpstreamStations(): Promise<Station[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<Station[]>(`${this.baseUrl}${NrelEndpoints.Stations}`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw 'An Error Happened';
          }),
        ),
    );

    return data;
  }

  async getLocalLastUpdatedAt(): Promise<Date> {
    return new Date();
  }

  async getUpstreamLastUpdatedAt(): Promise<Date> {
    return new Date();
  }

  private upstreamIsAhead(
    localLastUpdatedAt: Date,
    upstreamLastUpdatedAt: Date,
  ): boolean {
    if (upstreamLastUpdatedAt > localLastUpdatedAt) {
      this.logger.log('Upstream changes detected. Initiating sync process.');
      return true;
    }

    this.logger.log('No upstream changes detected. Ignoring sync process.');
    return false;
  }
}
