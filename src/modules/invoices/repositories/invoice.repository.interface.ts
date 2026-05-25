import type {
  Invoice,
  InvoiceStatus,
} from '../../../database/schema/invoices/invoices.schema';

export const INVOICE_REPOSITORY = 'INVOICE_REPOSITORY';

export interface CreateInvoiceInput {
  appointment_id: number;
  invoice_number: string;
  paid_amount: string;
  subtotal_unpaid: string;
  discount_total: string;
  total_amount: string;
  remaining_amount: string;
}

export interface UpdateInvoiceInput {
  id: number;
  status?: InvoiceStatus;
  paid_amount?: string;
  subtotal_unpaid?: string;
  discount_total?: string;
  total_amount?: string;
  remaining_amount?: string;
  payment_link_token?: string | null;
  payment_link_expires_at?: Date | null;
  paid_at?: Date | null;
  cancellation_reason?: string | null;
  cancelled_by_user_id?: string | null;
  cancelled_at?: Date | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IInvoiceRepository {
  abstract create(data: CreateInvoiceInput): Promise<Invoice>;
  abstract findById(id: number): Promise<Invoice | null>;
  abstract findByAppointmentId(appointmentId: number): Promise<Invoice | null>;
  abstract findAll(pagination: PaginationParams): Promise<Invoice[]>;
  abstract count(): Promise<number>;
  abstract update(data: UpdateInvoiceInput): Promise<Invoice>;
  abstract softDelete(id: number): Promise<void>;
}
