import { Test, TestingModule } from '@nestjs/testing';
import { NrelService } from './nrel.service';
import { Station, SyncRun } from '../db/entities';
import { ConfigService } from '@nestjs/config';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { of } from 'rxjs';
import { AxiosRequestHeaders, AxiosResponse } from 'axios';
import {
  GetAllStationsResponse,
  GetLastUpdatedResponse,
  NrelLog,
} from './types';
import { em } from '@/common/test-utils/modules';

const stations = [
  {
    access_code: 'public',
    access_days_time: '24 hours daily',
    access_detail_code: null,
    cards_accepted: 'A Cash Checks CREDIT D Debit M V Voyager Wright_Exp',
    date_last_confirmed: '2024-07-11',
    expected_date: null,
    fuel_type_code: 'E85',
    groups_with_access_code: 'Public',
    id: 1447,
    maximum_vehicle_class: 'MD',
    open_date: '1993-11-15',
    owner_type_code: 'P',
    restricted_access: false,
    status_code: 'E',
    funding_sources: null,
    facility_type: 'COOP',
    station_name: 'Sioux Valley Co-op - Cenex',
    station_phone: '605-886-5829',
    updated_at: '2025-02-12T00:16:32Z',
    geocode_status: '200-9',
    latitude: 44.904113,
    longitude: -97.130798,
    city: 'Watertown',
    country: 'US',
    intersection_directions: 'On Highway 20 at 3rd Street NW',
    plus4: null,
    state: 'SD',
    street_address: '220 10th St NW',
    zip: '57201',
    bd_blends: null,
    cng_dispenser_num: null,
    cng_fill_type_code: null,
    cng_has_rng: null,
    cng_psi: null,
    cng_renewable_source: null,
    cng_total_compression: null,
    cng_total_storage: null,
    cng_vehicle_class: null,
    e85_blender_pump: true,
    e85_other_ethanol_blends: ['E30-E35'],
    ev_connector_types: null,
    ev_dc_fast_num: null,
    ev_level1_evse_num: null,
    ev_level2_evse_num: null,
    ev_network: null,
    ev_network_web: null,
    ev_other_evse: null,
    ev_pricing: null,
    ev_renewable_source: null,
    ev_workplace_charging: null,
    hy_is_retail: null,
    hy_pressures: null,
    hy_standards: null,
    hy_status_link: null,
    lng_has_rng: null,
    lng_renewable_source: null,
    lng_vehicle_class: null,
    lpg_nozzle_types: null,
    lpg_primary: null,
    ng_fill_type_code: null,
    ng_psi: null,
    ng_vehicle_class: null,
    rd_blended_with_biodiesel: null,
    rd_blends: null,
    rd_blends_fr: null,
    rd_max_biodiesel_level: null,
    nps_unit_name: null,
    access_days_time_fr: null,
    intersection_directions_fr: null,
    bd_blends_fr: null,
    groups_with_access_code_fr: 'Public',
    ev_pricing_fr: null,
  },
];

const getUpstreamLastUpdatedResponse: AxiosResponse<
  GetLastUpdatedResponse,
  any
> = {
  data: {
    last_updated: '2025-05-12',
  },
  headers: {},
  config: {
    url: 'http://localhost/what/ever',
    headers: {} as AxiosRequestHeaders,
  },
  status: 200,
  statusText: 'OK',
};

const getUpstreamStationsResponse: AxiosResponse<GetAllStationsResponse, any> =
  {
    data: {
      station_counts: {
        total: 1,
        fuels: {
          E85: {
            total: 1,
          },
        },
      },
      station_locator_url: 'localhost:1234',
      total_results: 1,
      fuel_stations: stations,
    },
    headers: {},
    config: {
      url: 'http://localhost/what/ever',
      headers: {} as AxiosRequestHeaders,
    },
    status: 200,
    statusText: 'OK',
  };

describe('NrelService', () => {
  let service: NrelService;
  let logger: unknown;
  // let configService: DeepMocked<ConfigService>;
  let httpService: DeepMocked<HttpService>;
  let cacheManager: DeepMocked<Cache>;
  let stationRepository: DeepMocked<EntityRepository<Station>>;
  let syncRunRepository: DeepMocked<EntityRepository<SyncRun>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NrelService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService>({
            get: (key: string) => {
              return `useful-${key}`;
            },
          }),
        },
        {
          provide: HttpService,
          useValue: createMock<HttpService>(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
        {
          provide: EntityManager,
          useValue: em,
        },
        {
          provide: getRepositoryToken(Station),
          useValue: createMock<EntityRepository<Station>>(),
        },
        {
          provide: getRepositoryToken(SyncRun),
          useValue: createMock<EntityRepository<SyncRun>>(),
        },
      ],
    }).compile();

    service = module.get<NrelService>(NrelService);
    logger = jest.spyOn(service['logger'], 'log');
    httpService = module.get(HttpService);
    cacheManager = module.get(CACHE_MANAGER);
    stationRepository = module.get(getRepositoryToken(Station));
    syncRunRepository = module.get(getRepositoryToken(SyncRun));
  });

  afterEach(() => {
    em.clear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should run sync when upstream data source is ahead - no local run', async () => {
    syncRunRepository.findAll.mockResolvedValueOnce([]);
    httpService.get
      .mockReturnValueOnce(of(getUpstreamLastUpdatedResponse))
      .mockReturnValueOnce(of(getUpstreamStationsResponse));

    jest.spyOn(service, 'syncData').mockImplementation(async () => undefined);
    const run = jest.spyOn(service, 'syncData');

    await service.syncStations();

    expect(logger).toHaveBeenNthCalledWith(1, NrelLog.NoLocalSync);
    expect(logger).toHaveBeenNthCalledWith(2, NrelLog.WriteToCache);

    expect(run).toHaveBeenCalledTimes(1);
  });

  it('should run sync when upstream data source is ahead - valid local run', async () => {
    syncRunRepository.findAll.mockResolvedValueOnce([
      { id: 1, lastUpdatedAt: new Date('2025-03-12') } as SyncRun,
    ]);
    httpService.get
      .mockReturnValueOnce(of(getUpstreamLastUpdatedResponse))
      .mockReturnValueOnce(of(getUpstreamStationsResponse));
    const syncData = jest.spyOn(service, 'syncData');

    await service.syncStations();

    expect(logger).toHaveBeenNthCalledWith(1, NrelLog.UpstreamAhead);
    expect(logger).toHaveBeenNthCalledWith(2, NrelLog.WriteToCache);

    expect(syncData).toHaveBeenCalledTimes(1);
  });

  it('should not run sync when upstream is not ahead', async () => {
    syncRunRepository.findAll.mockResolvedValueOnce([
      { id: 1, lastUpdatedAt: new Date('2025-05-13') } as SyncRun,
    ]);
    httpService.get.mockReturnValueOnce(of(getUpstreamLastUpdatedResponse));
    const getAllUpstreamStations = jest.spyOn(
      service,
      'getAllUpstreamStations',
    );
    const syncData = jest.spyOn(service, 'syncData');

    await service.syncStations();

    expect(logger).toHaveBeenNthCalledWith(1, NrelLog.NoUpstream);
    expect(getAllUpstreamStations).toHaveBeenCalledTimes(0);
    expect(syncData).toHaveBeenCalledTimes(0);
  });

  it('should not call db for cache hit', async () => {
    cacheManager.get.mockResolvedValue('{"field":"useful"}');
    const findAll = jest.spyOn(stationRepository, 'findAll');

    await service.getAllStations();

    expect(logger).toHaveBeenNthCalledWith(1, NrelLog.CacheHit);
    expect(findAll).toHaveBeenCalledTimes(0);
  });

  it('should call db for cache miss', async () => {
    cacheManager.get.mockResolvedValue(null);
    const findAll = jest.spyOn(stationRepository, 'findAll');

    await service.getAllStations();

    expect(logger).toHaveBeenNthCalledWith(1, NrelLog.CacheMiss);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
