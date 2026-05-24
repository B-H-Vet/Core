import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, isNull, lt, gt, ne } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  appointments,
  type Appointment,
} from '../../../database/schema/appointments/appointments.schema';

import {
  CreateAppointmentInput,
  IAppointmentRepository,
  PaginationParams,
  UpdateAppointmentStatusInput,
} from './appointment.repository.interface';

@Injectable()
export class AppointmentRepository extends IAppointmentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(data: CreateAppointmentInput): Promise<Appointment> {
    await this.db.insert(appointments).values({
      user_id: data.user_id,
      vet_id: data.vet_id,
      pet_id: data.pet_id,
      date: data.date,
      end_date: data.end_date,
      status: 'PAGADA',
      invoice_number: data.invoice_number ?? null,
      paid_at: data.paid_at ?? new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.invoice_number, data.invoice_number ?? ''),
          isNull(appointments.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new Error('Error al crear la cita');
    }

    return result[0];
  }

  async findById(id: number): Promise<Appointment | null> {
    const result = await this.db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, id), isNull(appointments.deleted_at)))
      .limit(1);

    return result[0] ?? null;
  }

  async findAll(pagination: PaginationParams): Promise<Appointment[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    return this.db
      .select()
      .from(appointments)
      .where(isNull(appointments.deleted_at))
      .limit(limit)
      .offset(offset);
  }

  async findByClientUserId(
    userId: number,
    pagination: PaginationParams,
  ): Promise<Appointment[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    return this.db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.user_id, userId), isNull(appointments.deleted_at)),
      )
      .limit(limit)
      .offset(offset);
  }

  async findByVetId(
    vetId: number,
    pagination: PaginationParams,
  ): Promise<Appointment[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    return this.db
      .select()
      .from(appointments)
      .where(
        and(eq(appointments.vet_id, vetId), isNull(appointments.deleted_at)),
      )
      .limit(limit)
      .offset(offset);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(appointments)
      .where(isNull(appointments.deleted_at));

    return result[0]?.value ?? 0;
  }

  async countByClientUserId(userId: number): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(eq(appointments.user_id, userId), isNull(appointments.deleted_at)),
      );

    return result[0]?.value ?? 0;
  }

  async countByVetId(vetId: number): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(eq(appointments.vet_id, vetId), isNull(appointments.deleted_at)),
      );

    return result[0]?.value ?? 0;
  }

  async findVetConflict(
    vetId: number,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: number,
  ): Promise<Appointment | null> {
    const conditions = [
      eq(appointments.vet_id, vetId),
      ne(appointments.status, 'CANCELADA'),
      isNull(appointments.deleted_at),
      lt(appointments.date, endDate),
      gt(appointments.end_date, startDate),
    ];

    if (excludeAppointmentId) {
      conditions.push(ne(appointments.id, excludeAppointmentId));
    }

    const result = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .limit(1);

    return result[0] ?? null;
  }

  async updateStatus(data: UpdateAppointmentStatusInput): Promise<Appointment> {
    await this.db
      .update(appointments)
      .set({
        status: data.status,
        cancel_reason: data.cancel_reason,
        canceled_at: data.canceled_at,
        rescheduled_at: data.rescheduled_at,
        date: data.date,
        end_date: data.end_date,
        paid_at: data.paid_at,
        invoice_number: data.invoice_number,
        updated_at: new Date(),
      })
      .where(eq(appointments.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new Error('Error al actualizar la cita');
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(appointments)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(appointments.id, id));
  }
}
