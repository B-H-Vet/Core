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
}

export interface PaymentConfirmationEmailData {
  to: string;
  petName: string;
  vetName: string;
  appointmentDate: Date;
  clinicAddress: string;
  total: number;
}
