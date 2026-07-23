import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { MaintenancesModule } from './modules/maintenances/maintenances.module';
import { LegalModule } from './modules/legal/legal.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { GaragesModule } from './modules/garages/garages.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ExtensionsModule } from './modules/extensions/extensions.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    VehiclesModule,
    MaintenancesModule,
    LegalModule,
    NotificationsModule,
    GaragesModule,
    AppointmentsModule,
    AnalyticsModule,
    ExtensionsModule,
    AdminModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: parseInt(configService.get<string>('SMTP_PORT') || '587', 10),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"AutoCare Office Helper" <${configService.get<string>('SMTP_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
