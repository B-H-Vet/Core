export interface PrescriptionMedicine {
  medicine_detail_id: number;
  supply_id: number | null;
  quantity: number;
  unit_price: number;
  supply_name: string;
}

export interface InvoiceWithDetails {
  id: number;
  appointment_id: number;
  invoice_number: string;
  status: string;
  paid_amount: number;
  subtotal_unpaid: number;
  discount_total: number;
  total_amount: number;
  remaining_amount: number;
  paid_at: Date | null;
  cancellation_reason: string | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceWithClientDetails extends InvoiceWithDetails {
  client_id: number;
  client_name: string;
  client_email: string;
  pet_name: string;
  appointment_date: Date;
}

export interface InvoiceMedicineLine {
  id: number;
  supply_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  final_price: number;
}

export interface InvoiceServiceLine {
  id: number;
  service_name: string;
  unit_price: number;
  discount_percent: number;
  final_price: number;
}

export interface InvoiceInventoryLine {
  id: number;
  supply_name: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  final_price: number;
}

export interface AppointmentBasicInfo {
  id: number;
  client_id: number;
  status: string;
}

export interface ServiceBasicInfo {
  id: number;
  name: string;
  price: number;
}

export const INVOICE_QUERY_REPOSITORY = 'INVOICE_QUERY_REPOSITORY';

export abstract class IInvoiceQueryRepository {
  abstract findInvoiceWithClientDetails(
    id: number,
  ): Promise<InvoiceWithClientDetails | null>;
  abstract getAppointmentPaidAmount(appointmentId: number): Promise<number>;
  abstract getPrescriptionMedicines(
    appointmentId: number,
  ): Promise<PrescriptionMedicine[]>;
  abstract findAppointmentById(
    id: number,
  ): Promise<AppointmentBasicInfo | null>;
  abstract findServiceById(id: number): Promise<ServiceBasicInfo | null>;
  abstract findInvoiceWithDetails(
    id: number,
  ): Promise<InvoiceWithDetails | null>;
  abstract findInvoiceMedicineLines(
    invoiceId: number,
  ): Promise<InvoiceMedicineLine[]>;
  abstract findInvoiceServiceLines(
    invoiceId: number,
  ): Promise<InvoiceServiceLine[]>;
  abstract findInvoiceInventoryLines(
    invoiceId: number,
  ): Promise<InvoiceInventoryLine[]>;
  abstract findClientInvoices(
    clientId: number,
    pagination: { page: number; limit: number },
  ): Promise<{ invoices: InvoiceWithDetails[]; total: number }>;
}
