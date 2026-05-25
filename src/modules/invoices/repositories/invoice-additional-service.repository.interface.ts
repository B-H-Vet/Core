import type { InvoiceAdditionalService } from '../../../database/schema/invoices/invoice-additional-services.schema';

export const INVOICE_ADDITIONAL_SERVICE_REPOSITORY =
  'INVOICE_ADDITIONAL_SERVICE_REPOSITORY';

export interface CreateInvoiceAdditionalServiceInput {
  invoice_id: number;
  service_id: number;
  unit_price: string;
  discount_percent: string;
  final_price: string;
}

export interface UpdateDiscountInput {
  id: number;
  discount_percent: string;
  final_price: string;
}

export abstract class IInvoiceAdditionalServiceRepository {
  abstract create(
    data: CreateInvoiceAdditionalServiceInput,
  ): Promise<InvoiceAdditionalService>;
  abstract findByInvoiceId(
    invoiceId: number,
  ): Promise<InvoiceAdditionalService[]>;
  abstract findById(id: number): Promise<InvoiceAdditionalService | null>;
  abstract updateDiscount(
    data: UpdateDiscountInput,
  ): Promise<InvoiceAdditionalService>;
  abstract softDelete(id: number): Promise<void>;
  abstract softDeleteByInvoiceId(invoiceId: number): Promise<void>;
}
