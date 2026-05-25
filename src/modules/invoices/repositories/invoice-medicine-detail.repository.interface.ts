import type { InvoiceMedicineDetail } from '../../../database/schema/invoices/invoice-medicine-details.schema';

export const INVOICE_MEDICINE_DETAIL_REPOSITORY =
  'INVOICE_MEDICINE_DETAIL_REPOSITORY';

export interface CreateInvoiceMedicineDetailInput {
  invoice_id: number;
  medicine_detail_id: number;
  supply_id: number;
  quantity: number;
  unit_price: string;
  discount_percent: string;
  final_price: string;
}

export interface UpdateMedicineDiscountInput {
  id: number;
  discount_percent: string;
  final_price: string;
}

export abstract class IInvoiceMedicineDetailRepository {
  abstract createMany(data: CreateInvoiceMedicineDetailInput[]): Promise<void>;
  abstract findByInvoiceId(invoiceId: number): Promise<InvoiceMedicineDetail[]>;
  abstract findById(id: number): Promise<InvoiceMedicineDetail | null>;
  abstract updateDiscount(
    data: UpdateMedicineDiscountInput,
  ): Promise<InvoiceMedicineDetail>;
  abstract softDelete(id: number): Promise<void>;
  abstract softDeleteByInvoiceId(invoiceId: number): Promise<void>;
}
