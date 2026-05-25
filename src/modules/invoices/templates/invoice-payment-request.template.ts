import type { InvoicePaymentRequestEmailData } from './invoice-mail.types';

export function buildInvoicePaymentRequestHtml(
  data: InvoicePaymentRequestEmailData,
): string {
  const hours = Math.floor(data.expirationMinutes / 60);
  const hourLabel = hours === 1 ? 'hora' : 'horas';
  const expirationText =
    data.expirationMinutes >= 60
      ? `${String(hours)} ${hourLabel}`
      : `${String(data.expirationMinutes)} minutos`;

  return `
    <h2>Pago de factura pendiente</h2>

    <p>Hola ${data.clientName},</p>

    <p>Su factura <strong>${data.invoiceNumber}</strong> está pendiente de pago.</p>
    <p><strong>Total a pagar:</strong> $${data.totalAmount.toLocaleString('es-CO')}</p>

    <div style="margin-top:16px;padding:12px;background:#fff3e0;border-left:4px solid #ff9800;">
      <p><strong>Tiempo máximo de pago:</strong> ${expirationText}</p>
      <p>Pasado este tiempo, el enlace expirará y deberá solicitar uno nuevo.</p>
    </div>

    <div style="margin-top:16px;padding:12px;background:#e8f5e9;border-left:4px solid #4caf50;">
      <p><strong>Complete su pago aquí:</strong></p>
      <p><a href="${data.paymentLink}">${data.paymentLink}</a></p>
    </div>

    <p style="margin-top:24px;">Breaze & Harold Veterinary System</p>
  `;
}
