import type { InvoiceInventoryItem } from '../../../database/schema/invoices/invoice-inventory-items.schema';

export const INVOICE_INVENTORY_ITEM_REPOSITORY =
  'INVOICE_INVENTORY_ITEM_REPOSITORY';

export interface CreateInvoiceInventoryItemInput {
  invoice_id: number;
  supply_id: number;
  quantity: number;
  unit_price: string;
  discount_percent: string;
  final_price: string;
}

export interface UpdateInventoryItemDiscountInput {
  id: number;
  discount_percent: string;
  final_price: string;
}

export abstract class IInvoiceInventoryItemRepository {
  abstract create(
    data: CreateInvoiceInventoryItemInput,
  ): Promise<InvoiceInventoryItem>;
  abstract findByInvoiceId(invoiceId: number): Promise<InvoiceInventoryItem[]>;
  abstract findById(id: number): Promise<InvoiceInventoryItem | null>;
  abstract updateDiscount(
    data: UpdateInventoryItemDiscountInput,
  ): Promise<InvoiceInventoryItem>;
  abstract softDelete(id: number): Promise<void>;
  abstract softDeleteByInvoiceId(invoiceId: number): Promise<void>;
}
