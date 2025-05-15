import { Module } from '@nestjs/common';
import { NrelService } from './nrel.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
    }),
  ],
  providers: [NrelService],
  exports: [NrelService],
})
export class NrelModule {}
