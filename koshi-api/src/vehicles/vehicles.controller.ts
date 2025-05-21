import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

@ApiTags('Vehicles')
@Controller('vehicles')
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiBody({
    schema: {},
    examples: {
      newCar: {
        value: {
          year: 1999,
          make: 'Honda',
          model: 'Civic',
          fuelType: 'e85',
          fuelTankSize: 13.5,
          appxFuelEfficiency: 20.2,
          mileage: 175_000,
          vin: '12BCZXYZ84573ETOV',
        },
      },
    },
  })
  async create(
    @Req() req: Request,
    @Body() createVehicleDto: CreateVehicleDto,
  ) {
    return await this.vehiclesService.create(
      req.session.userId,
      createVehicleDto,
    );
  }

  @Get()
  async findAll(@Req() req: Request) {
    return await this.vehiclesService.findAll(req.session.userId);
  }

  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return await this.vehiclesService.findOne(req.session.userId, id);
  }

  @Patch(':id')
  @ApiBody({
    schema: {},
    examples: {
      updatedCar: {
        value: {
          year: 2025,
          make: 'Acura',
          model: 'Integra',
          fuelType: 'e85',
          fuelTankSize: 13.5,
          appxFuelEfficiency: 20.2,
          mileage: 175_000,
        },
      },
    },
  })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.update(
      req.session.userId,
      id,
      updateVehicleDto,
    );
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    return await this.vehiclesService.remove(req.session.userId, id);
  }
}
