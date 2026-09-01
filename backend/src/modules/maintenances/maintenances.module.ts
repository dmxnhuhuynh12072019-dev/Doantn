import { Module } from '@nestjs/common';
import { MaintenancesController } from './maintenances.controller';
import { MaintenancesService } from './maintenances.service';
import { AdvisorService } from './advisor.service';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, NotificationsModule],
  controllers: [MaintenancesController],
  providers: [MaintenancesService, AdvisorService],
  exports: [MaintenancesService, AdvisorService],
})
export class MaintenancesModule {}
