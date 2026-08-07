import { Module } from '@nestjs/common';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { PresetScheduleService } from './preset-schedule.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, PresetScheduleService],
  exports: [VehiclesService, PresetScheduleService],
})
export class VehiclesModule {}

