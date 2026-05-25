import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './common/audit/audit.module';
import { RedisModule } from './common/redis/redis.module';
import { DatabaseModule } from './database/database.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { HospitalizationsModule } from './modules/hospitalizations/hospitalizations.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { VaccinationAlertsModule } from './modules/vaccination-alerts/vaccination-alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuditModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    RedisModule,
    MedicalRecordsModule,
    AppointmentsModule,
    NotificationsModule,
    HospitalizationsModule,
    VaccinationAlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
