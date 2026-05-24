export interface InvoiceServiceItem {
  name: string;
  description: string;
  unitPrice: number;
  durationMinutes: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: Date;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | undefined;
  petName: string;
  vetName: string;
  appointmentDate: Date;
  clinicAddress: string;
  services: InvoiceServiceItem[];
  total: number;
  paymentLink: string;
}

export interface AppointmentConfirmationEmailData {
  to: string;
  petName: string;
  vetName: string;
  appointmentDate: Date;
  clinicAddress: string;
  invoicePdfBuffer: Buffer;
  invoiceFileName: string;
  paymentLink: string;
  services: { name: string; unitPrice: number; durationMinutes: number }[];
  total: number;
  paymentExpirationMinutes: number;
}

export interface PaymentConfirmationEmailData {
  to: string;
  petName: string;
  vetName: string;
  appointmentDate: Date;
  clinicAddress: string;
  total: number;
}
