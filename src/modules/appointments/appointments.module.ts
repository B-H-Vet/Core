import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MedicalRecordsModule } from '../medical-records/medical-records.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PetsModule } from '../pets/pets.module';
import { ServicesModule } from '../services/services.module';
import { VetsRepositoriesModule } from '../vets/vets-repositories.module';

import { AppointmentsController } from './controllers/appointments.controller';
import { AppointmentInfoRepository } from './repositories/appointment-info.repository';
import { APPOINTMENT_INFO_REPOSITORY } from './repositories/appointment-info.repository.interface';
import { AppointmentInvoiceQueryRepository } from './repositories/appointment-invoice-query.repository';
import { APPOINTMENT_INVOICE_QUERY_REPOSITORY } from './repositories/appointment-invoice-query.repository.interface';
import { AppointmentServiceRepository } from './repositories/appointment-service.repository';
import { APPOINTMENT_SERVICE_REPOSITORY } from './repositories/appointment-service.repository.interface';
import { AppointmentRepository } from './repositories/appointment.repository';
import { APPOINTMENT_REPOSITORY } from './repositories/appointment.repository.interface';
import { AppointmentAuditService } from './services/appointment-audit.service';
import { AppointmentRedisService } from './services/appointment-redis.service';
import { AppointmentsService } from './services/appointments.service';

@Module({
  imports: [
    ServicesModule,
    NotificationsModule,
    VetsRepositoriesModule,
    PetsModule,
    MedicalRecordsModule,
    ConfigModule,
  ],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    AppointmentRedisService,
    AppointmentAuditService,
    {
      provide: APPOINTMENT_REPOSITORY,
      useClass: AppointmentRepository,
    },
    {
      provide: APPOINTMENT_SERVICE_REPOSITORY,
      useClass: AppointmentServiceRepository,
    },
    {
      provide: APPOINTMENT_INFO_REPOSITORY,
      useClass: AppointmentInfoRepository,
    },
    {
      provide: APPOINTMENT_INVOICE_QUERY_REPOSITORY,
      useClass: AppointmentInvoiceQueryRepository,
    },
  ],
  exports: [
    AppointmentsService,
    APPOINTMENT_REPOSITORY,
    APPOINTMENT_SERVICE_REPOSITORY,
    APPOINTMENT_INFO_REPOSITORY,
    APPOINTMENT_INVOICE_QUERY_REPOSITORY,
  ],
})
export class AppointmentsModule {}
