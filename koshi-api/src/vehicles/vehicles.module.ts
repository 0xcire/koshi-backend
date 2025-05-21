import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module';
import { User, Vehicle } from '../db/entities';

@Module({
  controllers: [VehiclesController],
  providers: [VehiclesService],
  imports: [MikroOrmModule.forFeature([User, Vehicle]), AuthModule],
})
export class VehiclesModule {}
