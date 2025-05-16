import { Module } from '@nestjs/common';
import { NrelService } from './nrel.service';
import { HttpModule } from '@nestjs/axios';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Station, SyncRun } from '@/db/entities';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
    MikroOrmModule.forFeature([Station, SyncRun]),
  ],
  providers: [NrelService],
  exports: [NrelService],
})
export class NrelModule {}
