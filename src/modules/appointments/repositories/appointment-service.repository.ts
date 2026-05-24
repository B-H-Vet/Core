import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointmentServices } from '../../../database/schema/appointments/appointment-services.schema';
import { services } from '../../../database/schema/services/services.schema';

import {
  AppointmentServiceDetail,
  CreateAppointmentServiceInput,
  IAppointmentServiceRepository,
} from './appointment-service.repository.interface';

@Injectable()
export class AppointmentServiceRepository extends IAppointmentServiceRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async createMany(data: CreateAppointmentServiceInput[]): Promise<void> {
    if (data.length === 0) return;

    await this.db.insert(appointmentServices).values(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );
  }

  async findByAppointmentId(
    appointmentId: number,
  ): Promise<AppointmentServiceDetail[]> {
    return this.db
      .select({
        service_id: appointmentServices.service_id,
        name: services.name,
        unit_price: appointmentServices.unit_price,
      })
      .from(appointmentServices)
      .innerJoin(services, eq(appointmentServices.service_id, services.id))
      .where(
        and(
          eq(appointmentServices.appointment_id, appointmentId),
          isNull(appointmentServices.deleted_at),
        ),
      );
  }

  async softDeleteByAppointmentId(appointmentId: number): Promise<void> {
    await this.db
      .update(appointmentServices)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(appointmentServices.appointment_id, appointmentId));
  }
}
