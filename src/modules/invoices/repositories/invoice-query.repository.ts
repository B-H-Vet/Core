import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointmentServices } from '../../../database/schema/appointments/appointment-services.schema';
import { appointments } from '../../../database/schema/appointments/appointments.schema';
import { supplies } from '../../../database/schema/inventory/supplies.schema';
import { invoiceAdditionalServices } from '../../../database/schema/invoices/invoice-additional-services.schema';
import { invoiceInventoryItems } from '../../../database/schema/invoices/invoice-inventory-items.schema';
import { invoiceMedicineDetails } from '../../../database/schema/invoices/invoice-medicine-details.schema';
import { invoices } from '../../../database/schema/invoices/invoices.schema';
import { medicalRecords } from '../../../database/schema/medical-records/medical-records.schema';
import { medicineDetails } from '../../../database/schema/medical-records/medicine-details.schema';
import { services } from '../../../database/schema/services/services.schema';

import {
  type AppointmentBasicInfo,
  type InvoiceInventoryLine,
  type InvoiceMedicineLine,
  type InvoiceServiceLine,
  type InvoiceWithDetails,
  IInvoiceQueryRepository,
  type PrescriptionMedicine,
  type ServiceBasicInfo,
} from './invoice-query.repository.interface';

@Injectable()
export class InvoiceQueryRepository extends IInvoiceQueryRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async getAppointmentPaidAmount(appointmentId: number): Promise<number> {
    const result = await this.db
      .select({ unit_price: appointmentServices.unit_price })
      .from(appointmentServices)
      .where(
        and(
          eq(appointmentServices.appointment_id, appointmentId),
          isNull(appointmentServices.deleted_at),
        ),
      );

    return result.reduce((acc, item) => acc + Number(item.unit_price), 0);
  }

  async getPrescriptionMedicines(
    appointmentId: number,
  ): Promise<PrescriptionMedicine[]> {
    const record = await this.db
      .select({ id: medicalRecords.id })
      .from(medicalRecords)
      .where(eq(medicalRecords.appointment_id, appointmentId))
      .limit(1);

    if (!record[0]) {
      return [];
    }

    const medicines = await this.db
      .select({
        medicine_detail_id: medicineDetails.id,
        supply_id: medicineDetails.supply_id,
        quantity: medicineDetails.quantity,
        unit_price: supplies.price,
        supply_name: supplies.name,
        stock: supplies.stock,
      })
      .from(medicineDetails)
      .innerJoin(supplies, eq(medicineDetails.supply_id, supplies.id))
      .where(eq(medicineDetails.medical_record_id, record[0].id));

    return medicines
      .filter((m) => m.stock > 0)
      .map((m) => ({
        medicine_detail_id: m.medicine_detail_id,
        supply_id: m.supply_id,
        quantity: m.quantity,
        unit_price: Number(m.unit_price),
        supply_name: m.supply_name,
      }));
  }

  async findAppointmentById(id: number): Promise<AppointmentBasicInfo | null> {
    const result = await this.db
      .select({
        id: appointments.id,
        client_id: appointments.client_id,
        status: appointments.status,
      })
      .from(appointments)
      .where(and(eq(appointments.id, id), isNull(appointments.deleted_at)))
      .limit(1);

    return result[0] ?? null;
  }

  async findServiceById(id: number): Promise<ServiceBasicInfo | null> {
    const result = await this.db
      .select({
        id: services.id,
        name: services.name,
        price: services.price,
      })
      .from(services)
      .where(and(eq(services.id, id), isNull(services.deleted_at)))
      .limit(1);

    return result[0]
      ? {
          id: result[0].id,
          name: result[0].name,
          price: Number(result[0].price),
        }
      : null;
  }

  async findInvoiceWithDetails(id: number): Promise<InvoiceWithDetails | null> {
    const result = await this.db
      .select({
        id: invoices.id,
        appointment_id: invoices.appointment_id,
        invoice_number: invoices.invoice_number,
        status: invoices.status,
        paid_amount: invoices.paid_amount,
        subtotal_unpaid: invoices.subtotal_unpaid,
        discount_total: invoices.discount_total,
        total_amount: invoices.total_amount,
        remaining_amount: invoices.remaining_amount,
        paid_at: invoices.paid_at,
        cancellation_reason: invoices.cancellation_reason,
        cancelled_at: invoices.cancelled_at,
        created_at: invoices.created_at,
        updated_at: invoices.updated_at,
      })
      .from(invoices)
      .where(and(eq(invoices.id, id), isNull(invoices.deleted_at)))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0],
      paid_amount: Number(result[0].paid_amount),
      subtotal_unpaid: Number(result[0].subtotal_unpaid),
      discount_total: Number(result[0].discount_total),
      total_amount: Number(result[0].total_amount),
      remaining_amount: Number(result[0].remaining_amount),
    };
  }

  async findInvoiceMedicineLines(
    invoiceId: number,
  ): Promise<InvoiceMedicineLine[]> {
    const result = await this.db
      .select({
        id: invoiceMedicineDetails.id,
        supply_name: supplies.name,
        quantity: invoiceMedicineDetails.quantity,
        unit_price: invoiceMedicineDetails.unit_price,
        discount_percent: invoiceMedicineDetails.discount_percent,
        final_price: invoiceMedicineDetails.final_price,
      })
      .from(invoiceMedicineDetails)
      .innerJoin(supplies, eq(invoiceMedicineDetails.supply_id, supplies.id))
      .where(
        and(
          eq(invoiceMedicineDetails.invoice_id, invoiceId),
          isNull(invoiceMedicineDetails.deleted_at),
        ),
      );

    return result.map((r) => ({
      id: r.id,
      supply_name: r.supply_name,
      quantity: r.quantity,
      unit_price: Number(r.unit_price),
      discount_percent: Number(r.discount_percent),
      final_price: Number(r.final_price),
    }));
  }

  async findInvoiceServiceLines(
    invoiceId: number,
  ): Promise<InvoiceServiceLine[]> {
    const result = await this.db
      .select({
        id: invoiceAdditionalServices.id,
        service_name: services.name,
        unit_price: invoiceAdditionalServices.unit_price,
        discount_percent: invoiceAdditionalServices.discount_percent,
        final_price: invoiceAdditionalServices.final_price,
      })
      .from(invoiceAdditionalServices)
      .innerJoin(
        services,
        eq(invoiceAdditionalServices.service_id, services.id),
      )
      .where(
        and(
          eq(invoiceAdditionalServices.invoice_id, invoiceId),
          isNull(invoiceAdditionalServices.deleted_at),
        ),
      );

    return result.map((r) => ({
      id: r.id,
      service_name: r.service_name,
      unit_price: Number(r.unit_price),
      discount_percent: Number(r.discount_percent),
      final_price: Number(r.final_price),
    }));
  }

  async findInvoiceInventoryLines(
    invoiceId: number,
  ): Promise<InvoiceInventoryLine[]> {
    const result = await this.db
      .select({
        id: invoiceInventoryItems.id,
        supply_name: supplies.name,
        quantity: invoiceInventoryItems.quantity,
        unit_price: invoiceInventoryItems.unit_price,
        discount_percent: invoiceInventoryItems.discount_percent,
        final_price: invoiceInventoryItems.final_price,
      })
      .from(invoiceInventoryItems)
      .innerJoin(supplies, eq(invoiceInventoryItems.supply_id, supplies.id))
      .where(
        and(
          eq(invoiceInventoryItems.invoice_id, invoiceId),
          isNull(invoiceInventoryItems.deleted_at),
        ),
      );

    return result.map((r) => ({
      id: r.id,
      supply_name: r.supply_name,
      quantity: r.quantity,
      unit_price: Number(r.unit_price),
      discount_percent: Number(r.discount_percent),
      final_price: Number(r.final_price),
    }));
  }

  async findClientInvoices(
    clientId: number,
    pagination: { page: number; limit: number },
  ): Promise<{ invoices: InvoiceWithDetails[]; total: number }> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    const invoiceList = await this.db
      .select({
        id: invoices.id,
        appointment_id: invoices.appointment_id,
        invoice_number: invoices.invoice_number,
        status: invoices.status,
        paid_amount: invoices.paid_amount,
        subtotal_unpaid: invoices.subtotal_unpaid,
        discount_total: invoices.discount_total,
        total_amount: invoices.total_amount,
        remaining_amount: invoices.remaining_amount,
        paid_at: invoices.paid_at,
        cancellation_reason: invoices.cancellation_reason,
        cancelled_at: invoices.cancelled_at,
        created_at: invoices.created_at,
        updated_at: invoices.updated_at,
      })
      .from(invoices)
      .innerJoin(appointments, eq(invoices.appointment_id, appointments.id))
      .where(
        and(
          eq(appointments.client_id, clientId),
          isNull(invoices.deleted_at),
          isNull(appointments.deleted_at),
        ),
      )
      .limit(limit)
      .offset(offset);

    const countResult = await this.db
      .select({ value: count() })
      .from(invoices)
      .innerJoin(appointments, eq(invoices.appointment_id, appointments.id))
      .where(
        and(
          eq(appointments.client_id, clientId),
          isNull(invoices.deleted_at),
          isNull(appointments.deleted_at),
        ),
      );

    return {
      invoices: invoiceList.map((i) => ({
        ...i,
        paid_amount: Number(i.paid_amount),
        subtotal_unpaid: Number(i.subtotal_unpaid),
        discount_total: Number(i.discount_total),
        total_amount: Number(i.total_amount),
        remaining_amount: Number(i.remaining_amount),
      })),
      total: countResult[0]?.value ?? 0,
    };
  }
}
