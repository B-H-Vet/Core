import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { InternalServerBusinessException } from '../../../common/exceptions';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  invoiceMedicineDetails,
  type InvoiceMedicineDetail,
} from '../../../database/schema/invoices/invoice-medicine-details.schema';

import {
  CreateInvoiceMedicineDetailInput,
  IInvoiceMedicineDetailRepository,
  UpdateMedicineDiscountInput,
} from './invoice-medicine-detail.repository.interface';

@Injectable()
export class InvoiceMedicineDetailRepository extends IInvoiceMedicineDetailRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async createMany(data: CreateInvoiceMedicineDetailInput[]): Promise<void> {
    if (data.length === 0) return;

    await this.db.insert(invoiceMedicineDetails).values(
      data.map((item) => ({
        invoice_id: item.invoice_id,
        medicine_detail_id: item.medicine_detail_id,
        supply_id: item.supply_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount_percent: item.discount_percent,
        final_price: item.final_price,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );
  }

  async findByInvoiceId(invoiceId: number): Promise<InvoiceMedicineDetail[]> {
    return this.db
      .select()
      .from(invoiceMedicineDetails)
      .where(
        and(
          eq(invoiceMedicineDetails.invoice_id, invoiceId),
          isNull(invoiceMedicineDetails.deleted_at),
        ),
      );
  }

  async findById(id: number): Promise<InvoiceMedicineDetail | null> {
    const result = await this.db
      .select()
      .from(invoiceMedicineDetails)
      .where(
        and(
          eq(invoiceMedicineDetails.id, id),
          isNull(invoiceMedicineDetails.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async updateDiscount(
    data: UpdateMedicineDiscountInput,
  ): Promise<InvoiceMedicineDetail> {
    await this.db
      .update(invoiceMedicineDetails)
      .set({
        discount_percent: data.discount_percent,
        final_price: data.final_price,
        updated_at: new Date(),
      })
      .where(eq(invoiceMedicineDetails.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new InternalServerBusinessException(
        'MEDICINE_DISCOUNT_UPDATE_FAILED',
        'Error al actualizar el descuento del medicamento',
      );
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(invoiceMedicineDetails)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceMedicineDetails.id, id));
  }

  async softDeleteByInvoiceId(invoiceId: number): Promise<void> {
    await this.db
      .update(invoiceMedicineDetails)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceMedicineDetails.invoice_id, invoiceId));
  }
}
