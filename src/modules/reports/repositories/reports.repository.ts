import { Inject, Injectable } from '@nestjs/common';
import { and, between, eq, isNull, sql } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointments } from '../../../database/schema/appointments/appointments.schema';
import { users } from '../../../database/schema/auth/users.schema';
import { clients } from '../../../database/schema/clients/clients.schema';
import { supplies } from '../../../database/schema/inventory/supplies.schema';
import { invoices } from '../../../database/schema/invoices/invoices.schema';
import { pets } from '../../../database/schema/pets/pets.schema';
import { vets } from '../../../database/schema/vets/vets.schema';

import {
  AppointmentReportRow,
  BillingReportRow,
  InventoryReportRow,
  IReportsRepository,
} from './reports.repository.interface';

@Injectable()
export class ReportsRepository extends IReportsRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async findAppointmentsByPeriod(data: {
    startDate: Date;
    endDate: Date;
  }): Promise<AppointmentReportRow[]> {
    return this.db
      .select({
        appointment_id: appointments.id,
        appointment_date: appointments.date,
        status: appointments.status,
        client_email: users.email,
        pet_name: pets.name,
        vet_email: sql<string>`vet_user.email`,
      })
      .from(appointments)
      .innerJoin(pets, eq(appointments.pet_id, pets.id))
      .innerJoin(clients, eq(pets.client_id, clients.id))
      .innerJoin(users, eq(clients.user_id, users.id))
      .innerJoin(vets, eq(appointments.vet_id, vets.id))
      .innerJoin(sql`users as vet_user`, sql`vet_user.id = ${vets.user_id}`)
      .where(
        and(
          between(appointments.date, data.startDate, data.endDate),
          isNull(appointments.deleted_at),
        ),
      ) as Promise<AppointmentReportRow[]>;
  }

  async findBillingByPeriod(data: {
    startDate: Date;
    endDate: Date;
  }): Promise<BillingReportRow[]> {
    return this.db
      .select({
        invoice_id: invoices.id,
        appointment_id: invoices.appointment_id,
        subtotal: invoices.subtotal,
        total: invoices.total,
        status: invoices.status,
        created_at: invoices.created_at,
      })
      .from(invoices)
      .where(
        and(
          between(invoices.created_at, data.startDate, data.endDate),
          isNull(invoices.deleted_at),
        ),
      );
  }

  async findCurrentInventory(): Promise<InventoryReportRow[]> {
    return this.db
      .select({
        supply_id: supplies.id,
        name: supplies.name,
        stock: supplies.stock,
        min_stock: supplies.min_stock,
        price: supplies.price,
        expiring_date: supplies.expiring_date,
      })
      .from(supplies)
      .where(isNull(supplies.deleted_at));
  }
}
