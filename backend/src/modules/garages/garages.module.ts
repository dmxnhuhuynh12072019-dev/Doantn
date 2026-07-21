import { Module } from '@nestjs/common';
import { GaragesController } from './garages.controller';
import { GaragesService } from './garages.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GaragesController],
  providers: [GaragesService],
  exports: [GaragesService],
})
export class GaragesModule {}
