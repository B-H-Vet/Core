import type { InvoiceData } from './email.types';

export function buildInvoiceHtml(data: InvoiceData): string {
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(data.appointmentDate);

  const formattedIssueDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'long',
  }).format(data.issueDate);

  const servicesRows = data.services
    .map(
      (s) => `
          <tr>
            <td style="padding:8px;border:1px solid #ddd;">${s.name}</td>
            <td style="padding:8px;border:1px solid #ddd;">${s.description}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center;">${String(s.durationMinutes)} min</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right;">$${s.unitPrice.toLocaleString('es-CO')}</td>
          </tr>
        `,
    )
    .join('');

  return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Factura ${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          h1 { color: #2c3e50; }
          .header { margin-bottom: 24px; }
          .details { margin-bottom: 24px; }
          .details p { margin: 4px 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #f4f4f4; padding: 10px; border: 1px solid #ddd; text-align: left; }
          .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 12px; }
          .notice { margin-top: 24px; padding: 12px; background: #eef; border-left: 4px solid #2196f3; }
          .link-box { margin-top: 12px; padding: 12px; background: #e8f5e9; border-left: 4px solid #4caf50; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Breaze & Harold Veterinary System</h1>
          <p><strong>Factura / Resumen de Agendamiento</strong></p>
          <p>No. Factura: ${data.invoiceNumber}</p>
          <p>Fecha de emisión: ${formattedIssueDate}</p>
        </div>

        <div class="details">
          <p><strong>Cliente:</strong> ${data.clientName}</p>
          <p><strong>Correo:</strong> ${data.clientEmail}</p>
          ${data.clientPhone ? `<p><strong>Teléfono:</strong> ${data.clientPhone}</p>` : ''}
          <p><strong>Mascota:</strong> ${data.petName}</p>
          <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
          <p><strong>Fecha y hora de cita:</strong> ${formattedDate}</p>
          <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Descripción</th>
              <th>Duración</th>
              <th>Precio unitario</th>
            </tr>
          </thead>
          <tbody>
            ${servicesRows}
          </tbody>
        </table>

        <p class="total">Total a pagar: $${data.total.toLocaleString('es-CO')}</p>

        <div class="notice">
          <p><strong>Nota:</strong> El pago es obligatorio para confirmar la cita. Por favor, utilice el siguiente enlace para completar el pago.</p>
        </div>

        <div class="link-box">
          <p><strong>Enlace de pago:</strong></p>
          <p><a href="${data.paymentLink}">${data.paymentLink}</a></p>
        </div>

        <p style="margin-top:24px; font-size:0.9em; color:#666;">
          Recuerde llegar con 10 minutos de anticipación.
        </p>
      </body>
      </html>
    `;
}
