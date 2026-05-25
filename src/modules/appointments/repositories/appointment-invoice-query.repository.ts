import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointmentServices } from '../../../database/schema/appointments/appointment-services.schema';
import { appointments } from '../../../database/schema/appointments/appointments.schema';
import { users } from '../../../database/schema/auth/users.schema';
import { clients } from '../../../database/schema/clients/clients.schema';
import { invoices } from '../../../database/schema/invoices/invoices.schema';
import { medicalRecords } from '../../../database/schema/medical-records/medical-records.schema';
import { medicineDetails } from '../../../database/schema/medical-records/medicine-details.schema';
import { pets } from '../../../database/schema/pets/pets.schema';
import { vets } from '../../../database/schema/vets/vets.schema';

import {
  IAppointmentInvoiceQueryRepository,
  PendingInvoiceAppointment,
} from './appointment-invoice-query.repository.interface';

@Injectable()
export class AppointmentInvoiceQueryRepository extends IAppointmentInvoiceQueryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async findPendingInvoice(pagination: {
    page: number;
    limit: number;
  }): Promise<PendingInvoiceAppointment[]> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const serviceTotalSubquery = sql<number>`
      COALESCE((
        SELECT SUM(${appointmentServices.unit_price})
        FROM ${appointmentServices}
        WHERE ${appointmentServices.appointment_id} = ${appointments.id}
          AND ${isNull(appointmentServices.deleted_at)}
      ), 0)
    `;

    const medicineCountSubquery = sql<number>`
      COALESCE((
        SELECT COUNT(${medicineDetails.id})
        FROM ${medicalRecords}
        LEFT JOIN ${medicineDetails}
          ON ${eq(medicineDetails.medical_record_id, medicalRecords.id)}
        WHERE ${medicalRecords.appointment_id} = ${appointments.id}
      ), 0)
    `;

    const rows = await this.db
      .select({
        id: appointments.id,
        date: appointments.date,
        end_date: appointments.end_date,
        client_id: appointments.client_id,
        client_name: users.name,
        pet_id: appointments.pet_id,
        pet_name: pets.name,
        vet_id: appointments.vet_id,
        vet_name: sql<string>`(
          SELECT ${users.name}
          FROM ${users}
          WHERE ${users.id} = ${vets.user_id}
        )`.mapWith(String),
        service_total: serviceTotalSubquery.mapWith(Number),
        medicine_count: medicineCountSubquery.mapWith(Number),
      })
      .from(appointments)
      .innerJoin(clients, eq(clients.id, appointments.client_id))
      .innerJoin(users, eq(users.id, clients.user_id))
      .innerJoin(pets, eq(pets.id, appointments.pet_id))
      .innerJoin(vets, eq(vets.id, appointments.vet_id))
      .leftJoin(invoices, eq(invoices.appointment_id, appointments.id))
      .where(
        and(
          eq(appointments.status, 'ATENDIDA'),
          isNull(appointments.deleted_at),
          isNull(invoices.id),
        ),
      )
      .limit(limit)
      .offset(offset);

    return rows.map((row) => ({
      id: row.id,
      date: row.date,
      end_date: row.end_date,
      client_id: row.client_id,
      client_name: row.client_name,
      pet_id: row.pet_id,
      pet_name: row.pet_name,
      vet_id: row.vet_id,
      vet_name: row.vet_name,
      service_total: row.service_total,
      has_prescribed_medicines: row.medicine_count > 0,
    }));
  }

  async countPendingInvoice(): Promise<number> {
    const result = await this.db
      .select({
        value: sql<number>`COUNT(DISTINCT ${appointments.id})`,
      })
      .from(appointments)
      .leftJoin(invoices, eq(invoices.appointment_id, appointments.id))
      .where(
        and(
          eq(appointments.status, 'ATENDIDA'),
          isNull(appointments.deleted_at),
          isNull(invoices.id),
        ),
      );

    return result[0]?.value ?? 0;
  }
}
