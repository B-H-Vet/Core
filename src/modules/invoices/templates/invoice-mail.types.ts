export interface InvoicePaymentRequestEmailData {
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  paymentLink: string;
  expirationMinutes: number;
}

export interface InvoicePaymentConfirmationEmailData {
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
}
