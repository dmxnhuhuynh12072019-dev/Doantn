import { Module } from '@nestjs/common';
import { MaintenancesController } from './maintenances.controller';
import { MaintenancesService } from './maintenances.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MaintenancesController],
  providers: [MaintenancesService],
  exports: [MaintenancesService],
})
export class MaintenancesModule {}
