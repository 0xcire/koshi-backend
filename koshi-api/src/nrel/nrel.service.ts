import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CreateRequestContext,
  DriverException,
  EntityManager,
  EntityRepository,
} from '@mikro-orm/postgresql';
import { Station, SyncRun } from '@/db/entities';
import { catchError, firstValueFrom, map } from 'rxjs';
import { plainToInstance } from 'class-transformer';
import { AxiosError } from 'axios';
import { IConfig } from '@/common/config/types';
import { INrelService } from './nrel.inteface';
import {
  Access,
  FuelType,
  GetAllStationsResponse,
  GetLastUpdatedResponse,
  NrelEndpoints,
  ResponseFormat,
} from './types';

/*
 *  Service to handle sync between local db and nrel db for e85 fuel stations - cut down api requests
 *  Runs update check every week and acts accordingly
 *  provides fuel station data for display on map and routing
 *  // TODO: add caching in front of stations for above ^
 *  // TODO: sync should eventually be worked off w/ mq
 * */
@Injectable()
export class NrelService implements OnApplicationBootstrap, INrelService {
  private readonly logger = new Logger(NrelService.name);
  private readonly baseUrl;
  private readonly apiKey;

  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly httpService: HttpService,
    private readonly em: EntityManager,
    @InjectRepository(Station)
    private readonly stationRepository: EntityRepository<Station>,
    @InjectRepository(SyncRun)
    private readonly syncRunRepository: EntityRepository<SyncRun>,
  ) {
    this.baseUrl = this.configService.get('nrel.baseUrl', { infer: true });
    this.apiKey = this.configService.get('nrel.apiKey', { infer: true });
  }

  async onApplicationBootstrap() {
    await this.syncStations();
  }

  @CreateRequestContext()
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncStations(): Promise<void> {
    try {
      const localData = await this.localStationsTableHasData();
      if (localData) return; // on start up if there is data, wait till next interval to run sync

      const [localLastUpdatedAt, upstreamLastUpdatedAt] = await Promise.all([
        this.getLocalLastUpdatedAt(),
        this.getUpstreamLastUpdatedAt(),
      ]);

      if (!this.upstreamIsAhead(upstreamLastUpdatedAt, localLastUpdatedAt))
        return;

      const stations = await this.getAllUpstreamStations();

      await this.syncData(stations);
    } catch (error) {
      if (error instanceof DriverException) {
        this.logger.error(error.message);
      }

      if (error instanceof Error) {
        this.logger.error('Manual intervention required.');
      }
    }
  }

  async getAllUpstreamStations() {
    return await firstValueFrom(
      this.httpService
        .get<GetAllStationsResponse>(
          `${this.baseUrl}${NrelEndpoints.Stations}?format=${ResponseFormat.Json}&fuel_type=${FuelType.E85}&access=${Access.Public}&api_key=${this.apiKey}`,
        )
        .pipe(
          map((response) => response.data.fuel_stations),
          map((fuel_stations) =>
            fuel_stations.map((station) =>
              plainToInstance(Station, station, {
                excludeExtraneousValues: true,
              }),
            ),
          ),
        )
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw 'An Error Happened';
          }),
        ),
    );
  }

  async getLocalLastUpdatedAt(): Promise<Date | undefined> {
    const res = await this.syncRunRepository.findAll();
    if (res.length === 0) return undefined;

    return res[0].lastUpdatedAt;
  }

  async getUpstreamLastUpdatedAt(): Promise<Date> {
    const dateString = await firstValueFrom(
      this.httpService
        .get<GetLastUpdatedResponse>(
          `${this.baseUrl}${NrelEndpoints.LastUpdated}?format=${ResponseFormat.Json}&api_key=${this.apiKey}`,
        )
        .pipe(map((response) => response.data.last_updated))
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response?.data);
            throw 'Fix this error output';
          }),
        ),
    );

    return new Date(dateString);
  }

  private upstreamIsAhead(
    upstreamLastUpdatedAt: Date,
    localLastUpdatedAt?: Date,
  ): boolean {
    if (!localLastUpdatedAt) {
      this.logger.log('No local sync run detected. Initiating sync process.');
      return true;
    }

    if (upstreamLastUpdatedAt.valueOf() > localLastUpdatedAt.valueOf()) {
      this.logger.log('Upstream changes detected. Initiating sync process.');
      return true;
    }

    this.logger.log('No upstream changes detected. Ignoring sync process.');
    return false;
  }

  private async localStationsTableHasData(): Promise<boolean> {
    const x = await this.stationRepository
      .createQueryBuilder()
      .select('id')
      .limit(1);

    return x.length === 1;
  }

  private async syncData(stations: Station[]) {
    try {
      await Promise.all([
        this.syncRunRepository.createQueryBuilder().truncate(),
        this.stationRepository.createQueryBuilder().truncate(),
      ]);

      await Promise.all([
        this.syncRunRepository.insert({ lastUpdatedAt: new Date() }),
        this.stationRepository.insertMany(stations),
      ]);
    } catch (error) {
      if (error instanceof DriverException) {
        this.logger.error(error.message);
      }
    }
  }
}
