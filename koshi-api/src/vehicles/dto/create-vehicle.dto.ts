import { IsNumber, Length, Max } from 'class-validator';

export class CreateVehicleDto {
  @Length(1, 255)
  make!: string;

  @Length(1, 255)
  model!: string;

  @Max(9999)
  year!: number;

  @Length(1, 16)
  fuelType!: string;

  @IsNumber()
  fuelTankSize!: number;

  @Max(300)
  appxFuelEfficiency!: number;

  @Max(2_000_000)
  mileage!: number;

  @Length(1, 17)
  vin!: string;
}
