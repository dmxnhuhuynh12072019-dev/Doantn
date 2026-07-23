import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExtensionsController } from './extensions.controller';
import { ExtensionsService } from './extensions.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ExtensionsController],
  providers: [ExtensionsService],
  exports: [ExtensionsService],
})
export class ExtensionsModule {}

