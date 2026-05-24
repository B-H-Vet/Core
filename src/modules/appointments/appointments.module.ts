import { Module } from '@nestjs/common';

import { NotificationsModule } from '../notifications/notifications.module';
import { ServicesModule } from '../services/services.module';

import { AppointmentsController } from './controllers/appointments.controller';
import { AppointmentInfoRepository } from './repositories/appointment-info.repository';
import { APPOINTMENT_INFO_REPOSITORY } from './repositories/appointment-info.repository.interface';
import { AppointmentServiceRepository } from './repositories/appointment-service.repository';
import { APPOINTMENT_SERVICE_REPOSITORY } from './repositories/appointment-service.repository.interface';
import { AppointmentRepository } from './repositories/appointment.repository';
import { APPOINTMENT_REPOSITORY } from './repositories/appointment.repository.interface';
import { AppointmentsService } from './services/appointments.service';

@Module({
  imports: [ServicesModule, NotificationsModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
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
  ],
  exports: [
    AppointmentsService,
    APPOINTMENT_REPOSITORY,
    APPOINTMENT_SERVICE_REPOSITORY,
    APPOINTMENT_INFO_REPOSITORY,
  ],
})
export class AppointmentsModule {}
