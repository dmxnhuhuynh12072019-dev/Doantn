import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ExtensionsController } from './extensions.controller';
import { ExtensionsService } from './extensions.service';
import { OpenRouterService } from './openrouter.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ExtensionsController],
  providers: [ExtensionsService, OpenRouterService],
  exports: [ExtensionsService, OpenRouterService],
})
export class ExtensionsModule {}

