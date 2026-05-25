import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { InternalServerBusinessException } from '../../../common/exceptions';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  invoiceAdditionalServices,
  type InvoiceAdditionalService,
} from '../../../database/schema/invoices/invoice-additional-services.schema';

import {
  CreateInvoiceAdditionalServiceInput,
  IInvoiceAdditionalServiceRepository,
  UpdateDiscountInput,
} from './invoice-additional-service.repository.interface';

@Injectable()
export class InvoiceAdditionalServiceRepository extends IInvoiceAdditionalServiceRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(
    data: CreateInvoiceAdditionalServiceInput,
  ): Promise<InvoiceAdditionalService> {
    await this.db.insert(invoiceAdditionalServices).values({
      invoice_id: data.invoice_id,
      service_id: data.service_id,
      unit_price: data.unit_price,
      discount_percent: data.discount_percent,
      final_price: data.final_price,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(invoiceAdditionalServices)
      .where(
        and(
          eq(invoiceAdditionalServices.invoice_id, data.invoice_id),
          eq(invoiceAdditionalServices.service_id, data.service_id),
          isNull(invoiceAdditionalServices.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new InternalServerBusinessException(
        'ADDITIONAL_SERVICE_CREATION_FAILED',
        'Error al crear el servicio adicional de la factura',
      );
    }

    return result[0];
  }

  async findByInvoiceId(
    invoiceId: number,
  ): Promise<InvoiceAdditionalService[]> {
    return this.db
      .select()
      .from(invoiceAdditionalServices)
      .where(
        and(
          eq(invoiceAdditionalServices.invoice_id, invoiceId),
          isNull(invoiceAdditionalServices.deleted_at),
        ),
      );
  }

  async findById(id: number): Promise<InvoiceAdditionalService | null> {
    const result = await this.db
      .select()
      .from(invoiceAdditionalServices)
      .where(
        and(
          eq(invoiceAdditionalServices.id, id),
          isNull(invoiceAdditionalServices.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async updateDiscount(
    data: UpdateDiscountInput,
  ): Promise<InvoiceAdditionalService> {
    await this.db
      .update(invoiceAdditionalServices)
      .set({
        discount_percent: data.discount_percent,
        final_price: data.final_price,
        updated_at: new Date(),
      })
      .where(eq(invoiceAdditionalServices.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new InternalServerBusinessException(
        'ADDITIONAL_SERVICE_DISCOUNT_UPDATE_FAILED',
        'Error al actualizar el descuento del servicio adicional',
      );
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(invoiceAdditionalServices)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceAdditionalServices.id, id));
  }

  async softDeleteByInvoiceId(invoiceId: number): Promise<void> {
    await this.db
      .update(invoiceAdditionalServices)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceAdditionalServices.invoice_id, invoiceId));
  }
}
