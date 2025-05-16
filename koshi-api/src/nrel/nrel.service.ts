import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
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
import { ONE_HOUR_AS_MS } from '@/types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import SuperJSON from 'superjson';

/*
 *  Service to handle sync between local db and nrel db for e85 fuel stations - cut down api requests
 *  Runs update check every week and acts accordingly
 *  provides fuel station data for display on map and routing
 * */
@Injectable()
export class NrelService implements OnApplicationBootstrap, INrelService {
  private readonly logger = new Logger(NrelService.name);
  private readonly baseUrl;
  private readonly apiKey;

  constructor(
    private readonly configService: ConfigService<IConfig>,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly em: EntityManager,
    @InjectRepository(Station)
    private readonly stationRepository: EntityRepository<Station>,
    @InjectRepository(SyncRun)
    private readonly syncRunRepository: EntityRepository<SyncRun>,
  ) {
    this.baseUrl = this.configService.get('nrel.baseUrl', { infer: true });
    this.apiKey = this.configService.get('nrel.apiKey', { infer: true });
  }

  @CreateRequestContext()
  async onApplicationBootstrap() {
    await this.syncStations();
  }

  @CreateRequestContext()
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async syncStations(): Promise<void> {
    try {
      const [localLastUpdatedAt, upstreamLastUpdatedAt] = await Promise.all([
        this.getLocalLastUpdatedAt(),
        this.getUpstreamLastUpdatedAt(),
      ]);

      if (!this.upstreamIsAhead(upstreamLastUpdatedAt, localLastUpdatedAt))
        return;

      const stations = await this.getAllUpstreamStations();

      await this.writeStationsToCache(stations);
      await this.syncData(stations);
    } catch (error) {
      if (error instanceof DriverException) {
        this.logger.error(error.message);
      }

      if (error instanceof Error) {
        this.logger.error(error.message);
      }
    }
  }

  async getAllStations(): Promise<Station[]> {
    const cachedStations: string | null =
      await this.cacheManager.get('stations');

    if (cachedStations) {
      this.logger.log('Cache Hit - Stations');
      return SuperJSON.parse(cachedStations);
    }

    this.logger.log('Cache Miss - Stations');

    const stations = await this.stationRepository.findAll();

    await this.writeStationsToCache(stations);

    return stations;
  }

  private async writeStationsToCache(stations: Station[]): Promise<void> {
    this.logger.log('Writing stations to cache');
    await this.cacheManager.set(
      'stations',
      SuperJSON.stringify(stations),
      ONE_HOUR_AS_MS,
    );
  }

  async getAllUpstreamStations(): Promise<Station[]> {
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
            // TODO: handle this
            this.logger.error(error.response?.data);
            throw 'An Error Happened';
          }),
        ),
    );
  }

  async getLocalLastUpdatedAt(): Promise<Date | undefined> {
    const res = await this.syncRunRepository
      .createQueryBuilder()
      .select('*')
      .limit(1);

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

  /**
   *  NREL only supplies a last updated date but no subset of updated data otherwise would utilize upsert
   */
  private async syncData(stations: Station[]): Promise<void> {
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
