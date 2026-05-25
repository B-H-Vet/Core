import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, isNull } from 'drizzle-orm';

import { InternalServerBusinessException } from '../../../common/exceptions';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  invoices,
  type Invoice,
} from '../../../database/schema/invoices/invoices.schema';

import {
  CreateInvoiceInput,
  IInvoiceRepository,
  PaginationParams,
  UpdateInvoiceInput,
} from './invoice.repository.interface';

@Injectable()
export class InvoiceRepository extends IInvoiceRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(data: CreateInvoiceInput): Promise<Invoice> {
    await this.db.insert(invoices).values({
      appointment_id: data.appointment_id,
      invoice_number: data.invoice_number,
      paid_amount: data.paid_amount,
      subtotal_unpaid: data.subtotal_unpaid,
      discount_total: data.discount_total,
      total_amount: data.total_amount,
      remaining_amount: data.remaining_amount,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.invoice_number, data.invoice_number),
          isNull(invoices.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new InternalServerBusinessException(
        'INVOICE_CREATION_FAILED',
        'Error al crear la factura',
      );
    }

    return result[0];
  }

  async findById(id: number): Promise<Invoice | null> {
    const result = await this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), isNull(invoices.deleted_at)))
      .limit(1);

    return result[0] ?? null;
  }

  async findByAppointmentId(appointmentId: number): Promise<Invoice | null> {
    const result = await this.db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.appointment_id, appointmentId),
          isNull(invoices.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async findAll(pagination: PaginationParams): Promise<Invoice[]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 10;
    const offset = (page - 1) * limit;

    return this.db
      .select()
      .from(invoices)
      .where(isNull(invoices.deleted_at))
      .limit(limit)
      .offset(offset);
  }

  async count(): Promise<number> {
    const result = await this.db
      .select({ value: count() })
      .from(invoices)
      .where(isNull(invoices.deleted_at));

    return result[0]?.value ?? 0;
  }

  async update(data: UpdateInvoiceInput): Promise<Invoice> {
    await this.db
      .update(invoices)
      .set({
        status: data.status,
        paid_amount: data.paid_amount,
        subtotal_unpaid: data.subtotal_unpaid,
        discount_total: data.discount_total,
        total_amount: data.total_amount,
        remaining_amount: data.remaining_amount,
        payment_link_token: data.payment_link_token,
        payment_link_expires_at: data.payment_link_expires_at,
        paid_at: data.paid_at,
        cancellation_reason: data.cancellation_reason,
        cancelled_by_user_id: data.cancelled_by_user_id,
        cancelled_at: data.cancelled_at,
        updated_at: new Date(),
      })
      .where(eq(invoices.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new InternalServerBusinessException(
        'INVOICE_UPDATE_FAILED',
        'Error al actualizar la factura',
      );
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(invoices)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoices.id, id));
  }
}
