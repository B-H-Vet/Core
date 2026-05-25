import type { InvoicePaymentConfirmationEmailData } from './invoice-mail.types';

export function buildInvoicePaymentConfirmationHtml(
  data: InvoicePaymentConfirmationEmailData,
): string {
  return `
    <h2>Pago confirmado</h2>

    <p>Hola ${data.clientName},</p>

    <p>El pago de su factura <strong>${data.invoiceNumber}</strong> fue procesado exitosamente.</p>
    <p><strong>Total pagado:</strong> $${data.totalAmount.toLocaleString('es-CO')}</p>

    <p style="margin-top:24px;">Gracias por confiar en nosotros.</p>

    <p>Breaze & Harold Veterinary System</p>
  `;
}
