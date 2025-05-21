import { Test, TestingModule } from '@nestjs/testing';
import { VehiclesService } from './vehicles.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  FindAllOptions,
  FindOneOrFailOptions,
  wrap,
} from '@mikro-orm/postgresql';
import { Vehicle } from '../db/entities';
import { em } from '@/common/test-utils/modules';
import { getCacheKey } from '../common/utils/cache-key';
import { CacheableEntities, ONE_HOUR_AS_MS } from '../types';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { tryCatch } from '../common/utils/try-catch';

const MOCK_USER_ID = 'user-id';
const mockUserVehicle = {
  id: 'dcb41d20-fb05-4410-8fe0-3129041b7198',
  createdAt: '2025-05-19T16:19:11.442Z',
  updatedAt: '2025-05-19T16:19:11.442Z',
  make: 'Acura',
  model: 'Integra',
  year: 1999,
  fuelType: 'e85',
  fuelTankSize: 13.5,
  appxFuelEfficiency: 20.2,
  mileage: 175000,
  vin: 'a-real-vin',
  user: {
    id: MOCK_USER_ID,
  },
};

const mockUpdateVehicleDto: UpdateVehicleDto = {
  fuelTankSize: 23.5,
  appxFuelEfficiency: 27.2,
  mileage: 275000,
};

// TODO: refactor
describe('VehiclesService', () => {
  let service: VehiclesService;
  let cacheManager: DeepMocked<Cache>;
  let mockVehicleRepository: DeepMocked<EntityRepository<Vehicle>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: CACHE_MANAGER,
          useValue: createMock<Cache>(),
        },
        {
          provide: EntityManager,
          useValue: em,
        },
        {
          provide: getRepositoryToken(Vehicle),
          useValue: createMock<EntityRepository<Vehicle>>(),
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    cacheManager = module.get(CACHE_MANAGER);
    mockVehicleRepository = module.get(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    em.clear();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: fix nrel service spys on createMock() methods
  it("should find all user's vehicles - cache miss", async () => {
    const repositorySpy = mockVehicleRepository.findAll;
    const cacheSpy = cacheManager.set;
    cacheManager.get.mockResolvedValue(null);

    // TODO: if vehicle repository gets used elsewhere, obviously refactor mockImpls out
    mockVehicleRepository.findAll.mockImplementation(
      async (opts: FindAllOptions<Vehicle, never, '*', never> | undefined) => {
        if (!opts) return [];
        return [mockUserVehicle];
      },
    );

    const res = await service.findAll(MOCK_USER_ID);

    expect(res).toEqual({ vehicles: [mockUserVehicle] });
    expect(repositorySpy).toHaveBeenCalledWith({
      where: { user: MOCK_USER_ID },
    });
    expect(cacheSpy).toHaveBeenCalledWith(
      getCacheKey(CacheableEntities.Vehicles, MOCK_USER_ID),
      [mockUserVehicle],
      ONE_HOUR_AS_MS,
    );
  });

  it("should find all user's vehicles - cache hit", async () => {
    const spy = cacheManager.get;
    cacheManager.get.mockResolvedValue([mockUserVehicle]);

    const res = await service.findAll(MOCK_USER_ID);

    expect(res).toEqual({ vehicles: [mockUserVehicle] });
    expect(spy).toHaveBeenCalledWith(
      getCacheKey(CacheableEntities.Vehicles, MOCK_USER_ID),
    );
  });

  it('should find one vehicle - cache miss', async () => {
    const repositorySpy = mockVehicleRepository.findOneOrFail;
    const cacheSpy = cacheManager.set;
    cacheManager.get.mockResolvedValue(null);
    mockVehicleRepository.findOneOrFail.mockImplementation(
      async (
        where: FilterQuery<Vehicle>,
        opts?:
          | FindOneOrFailOptions<Vehicle, string, string, string>
          | undefined,
      ) => {
        if (where && !opts) {
          return mockUserVehicle;
        }

        throw new NotFoundException();
      },
    );

    const res = await service.findOne(MOCK_USER_ID, mockUserVehicle.id);

    expect(res).toEqual({ vehicle: mockUserVehicle });
    expect(repositorySpy).toHaveBeenCalledWith({
      id: mockUserVehicle.id,
      user: { id: MOCK_USER_ID },
    });
    expect(cacheSpy).toHaveBeenCalledWith(
      getCacheKey(mockUserVehicle.id, MOCK_USER_ID),
      mockUserVehicle,
      ONE_HOUR_AS_MS,
    );
  });

  it('should find one vehicle - cache hit', async () => {
    const spy = cacheManager.get;
    cacheManager.get.mockResolvedValue(mockUserVehicle);

    const res = await service.findOne(MOCK_USER_ID, mockUserVehicle.id);

    expect(res).toEqual({ vehicle: mockUserVehicle });
    expect(spy).toHaveBeenCalledWith(
      getCacheKey(mockUserVehicle.id, MOCK_USER_ID),
    );
  });

  it('should update vehicle', async () => {
    const repositorySpy = mockVehicleRepository.assign;
    const emSpy = jest.spyOn(em, 'flush');
    const cacheSpy = cacheManager.set;

    mockVehicleRepository.assign.mockImplementation(
      //@ts-expect-error type
      () => Object.assign(mockUserVehicle, mockUpdateVehicleDto),
    );

    jest
      .spyOn(service, 'findOne')
      // @ts-expect-error user type
      .mockResolvedValue({ vehicle: mockUserVehicle });

    const res = await service.update(
      MOCK_USER_ID,
      mockUserVehicle.id,
      mockUpdateVehicleDto,
    );

    const updatedVehicle = Object.assign(mockUserVehicle, mockUpdateVehicleDto);

    expect(repositorySpy).toHaveBeenCalledWith(
      mockUserVehicle,
      mockUpdateVehicleDto,
    );
    expect(emSpy).toHaveBeenCalledTimes(1);
    expect(cacheSpy).toHaveBeenCalledWith(
      getCacheKey(mockUserVehicle.id, MOCK_USER_ID),
      updatedVehicle,
      ONE_HOUR_AS_MS,
    );
    expect(res).toEqual({ vehicle: updatedVehicle });
  });

  it('should not allow updating vehicles identifying info', async () => {
    const promise = service.update(MOCK_USER_ID, mockUserVehicle.id, {
      make: 'Throw',
    });

    const { data, error } = await tryCatch(promise);
    const errorIsConflict = error instanceof ConflictException;

    expect(data).toEqual(null);
    expect(errorIsConflict).toEqual(true);
  });

  it('should hard delete vehicle', async () => {
    const repositorySpy = mockVehicleRepository.nativeDelete;
    const cacheSpy = cacheManager.del;

    await service.remove(MOCK_USER_ID, mockUserVehicle.id);

    expect(repositorySpy).toHaveBeenCalledWith({ id: mockUserVehicle.id });
    expect(cacheSpy).toHaveBeenCalledWith(
      getCacheKey(mockUserVehicle.id, MOCK_USER_ID),
    );
  });

  // add following to e2e
  it('should create a new vehicle', async () => {});
  it('should throw 409 for creating vehicle with overlapping VIN', () => {});
  it('should throw 404 for vehicle not found', () => {});
});
