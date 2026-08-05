import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { ZaloZnsService } from './zalo-zns.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, ZaloZnsService],
  exports: [NotificationsService, NotificationsGateway, ZaloZnsService],
})
export class NotificationsModule {}

