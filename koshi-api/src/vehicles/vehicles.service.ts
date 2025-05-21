import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import {
  EntityManager,
  EntityRepository,
  NotFoundError,
} from '@mikro-orm/postgresql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Vehicle } from '../db/entities';
import { tryCatch } from '../common/utils/try-catch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheableEntities, ONE_HOUR_AS_MS } from '../types';
import { getCacheKey } from '../common/utils/cache-key';
import { VehicleLog } from './types';

@Injectable()
export class VehiclesService {
  private readonly logger = new Logger(VehiclesService.name);
  private readonly FORBIDDEN_UPDATE_COLUMNS = ['make', 'model', 'year', 'vin'];

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly em: EntityManager,
    @InjectRepository(Vehicle)
    private readonly vehiclesRepository: EntityRepository<Vehicle>,
  ) {}

  async create(userId: string, createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create({
      ...createVehicleDto,
      user: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.logger.log(`Creating new vehicle: ${vehicle} for user: ${userId}`);

    await this.em.flush();

    await this.cacheManager.set(
      JSON.stringify(getCacheKey(vehicle.id, userId)),
      vehicle,
      ONE_HOUR_AS_MS,
    );

    return { vehicle };
  }

  /**
   * Amount of vehicles is roughly controlled via a required VIN when creating
   * can't imagine this would exceed ~5 for a user
   */
  async findAll(userId: string) {
    const cachedVehicles = await this.cacheManager.get(
      getCacheKey(CacheableEntities.Vehicles, userId),
    );

    if (cachedVehicles) {
      this.logger.log(VehicleLog.CacheHit);
      return { vehicles: cachedVehicles };
    }

    this.logger.log(VehicleLog.CacheMiss);

    const vehicles = await this.vehiclesRepository.findAll({
      where: { user: userId },
    });

    await this.cacheManager.set(
      getCacheKey(CacheableEntities.Vehicles, userId),
      vehicles,
      ONE_HOUR_AS_MS,
    );

    this.logger.log(`Found ${vehicles.length} vehicles for user: ${userId}`);
    return { vehicles };
  }

  async findOne(userId: string, id: string) {
    const cachedVehicle: Vehicle | null = await this.cacheManager.get(
      getCacheKey(id, userId),
    );

    if (cachedVehicle) {
      this.logger.log(VehicleLog.CacheHit);
      return { vehicle: cachedVehicle };
    }

    this.logger.log(VehicleLog.CacheMiss);

    const findOneOrFailPromise = this.vehiclesRepository.findOneOrFail({
      id,
      user: {
        id: userId,
      },
    });
    const { data: vehicle, error } = await tryCatch(findOneOrFailPromise);

    if (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }

    await this.cacheManager.set(
      getCacheKey(vehicle.id, userId),
      vehicle,
      ONE_HOUR_AS_MS,
    );

    this.logger.log(`Found vehicle by id: ${id}`);

    return { vehicle };
  }

  async update(userId: string, id: string, updateVehicleDto: UpdateVehicleDto) {
    if (
      Object.keys(updateVehicleDto).some((key) =>
        this.FORBIDDEN_UPDATE_COLUMNS.includes(key),
      )
    ) {
      throw new ConflictException(
        "Can't update given fields. Are you trying to enter a new vehicle?",
      );
    }

    const { vehicle } = await this.findOne(userId, id);

    const updatedVehicle = this.vehiclesRepository.assign(
      vehicle,
      updateVehicleDto,
    );

    await this.em.flush();

    await this.cacheManager.set(
      getCacheKey(vehicle.id, userId),
      vehicle,
      ONE_HOUR_AS_MS,
    );

    this.logger.log(
      `Updating existing vehicle: ${vehicle} with: ${updateVehicleDto}`,
    );

    return { vehicle: updatedVehicle };
  }

  async remove(userId: string, id: string) {
    this.logger.log(`Removed vehicle by id: ${id}`);

    await this.vehiclesRepository.nativeDelete({ id });
    await this.cacheManager.del(getCacheKey(id, userId));
  }
}
