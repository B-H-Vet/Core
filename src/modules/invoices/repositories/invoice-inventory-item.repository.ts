import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { InternalServerBusinessException } from '../../../common/exceptions';
import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  invoiceInventoryItems,
  type InvoiceInventoryItem,
} from '../../../database/schema/invoices/invoice-inventory-items.schema';

import {
  CreateInvoiceInventoryItemInput,
  IInvoiceInventoryItemRepository,
  UpdateInventoryItemDiscountInput,
} from './invoice-inventory-item.repository.interface';

@Injectable()
export class InvoiceInventoryItemRepository extends IInvoiceInventoryItemRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(
    data: CreateInvoiceInventoryItemInput,
  ): Promise<InvoiceInventoryItem> {
    await this.db.insert(invoiceInventoryItems).values({
      invoice_id: data.invoice_id,
      supply_id: data.supply_id,
      quantity: data.quantity,
      unit_price: data.unit_price,
      discount_percent: data.discount_percent,
      final_price: data.final_price,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(invoiceInventoryItems)
      .where(
        and(
          eq(invoiceInventoryItems.invoice_id, data.invoice_id),
          eq(invoiceInventoryItems.supply_id, data.supply_id),
          isNull(invoiceInventoryItems.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new InternalServerBusinessException(
        'INVENTORY_ITEM_CREATION_FAILED',
        'Error al crear el item de inventario de la factura',
      );
    }

    return result[0];
  }

  async findByInvoiceId(invoiceId: number): Promise<InvoiceInventoryItem[]> {
    return this.db
      .select()
      .from(invoiceInventoryItems)
      .where(
        and(
          eq(invoiceInventoryItems.invoice_id, invoiceId),
          isNull(invoiceInventoryItems.deleted_at),
        ),
      );
  }

  async findById(id: number): Promise<InvoiceInventoryItem | null> {
    const result = await this.db
      .select()
      .from(invoiceInventoryItems)
      .where(
        and(
          eq(invoiceInventoryItems.id, id),
          isNull(invoiceInventoryItems.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }

  async updateDiscount(
    data: UpdateInventoryItemDiscountInput,
  ): Promise<InvoiceInventoryItem> {
    await this.db
      .update(invoiceInventoryItems)
      .set({
        discount_percent: data.discount_percent,
        final_price: data.final_price,
        updated_at: new Date(),
      })
      .where(eq(invoiceInventoryItems.id, data.id));

    const updated = await this.findById(data.id);

    if (!updated) {
      throw new InternalServerBusinessException(
        'INVENTORY_ITEM_DISCOUNT_UPDATE_FAILED',
        'Error al actualizar el descuento del item de inventario',
      );
    }

    return updated;
  }

  async softDelete(id: number): Promise<void> {
    await this.db
      .update(invoiceInventoryItems)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceInventoryItems.id, id));
  }

  async softDeleteByInvoiceId(invoiceId: number): Promise<void> {
    await this.db
      .update(invoiceInventoryItems)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(invoiceInventoryItems.invoice_id, invoiceId));
  }
}
