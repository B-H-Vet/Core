import { wrapReport, escapeHtml } from '../../reports/templates/base/layout';
import { buildReportTable } from '../../reports/templates/components/report-table.component';
import type {
  InvoiceInventoryLine,
  InvoiceMedicineLine,
  InvoiceServiceLine,
  InvoiceWithClientDetails,
} from '../repositories/invoice-query.repository.interface';

function getStatusBadge(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (normalized === 'pagada') {
    return '<span class="badge badge-success">Pagada</span>';
  }
  if (normalized === 'pendiente') {
    return '<span class="badge badge-warning">Pendiente</span>';
  }
  if (normalized === 'anulada') {
    return '<span class="badge badge-danger">Anulada</span>';
  }
  return `<span class="badge badge-neutral">${escapeHtml(status)}</span>`;
}

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

export function buildInvoicePdfTemplate(
  invoice: InvoiceWithClientDetails,
  medicines: InvoiceMedicineLine[],
  services: InvoiceServiceLine[],
  inventoryItems: InvoiceInventoryLine[],
): string {
  const dateStr = invoice.created_at.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeStr = invoice.created_at.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const appointmentDateStr = invoice.appointment_date.toLocaleDateString(
    'es-CO',
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const headerInfo = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 24px; align-items: flex-start;">
      <div>
        <div class="section-title">Información de la Factura</div>
        <div style="font-size: 9px; color: var(--text-secondary); line-height: 1.8; margin-top: 8px;">
          <strong>Número:</strong> <span class="font-mono">${escapeHtml(invoice.invoice_number)}</span><br>
          <strong>Fecha emisión:</strong> ${dateStr} ${timeStr}<br>
          <strong>Cita:</strong> ${appointmentDateStr}<br>
          <strong>Estado:</strong> ${getStatusBadge(invoice.status)}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="section-title">Cliente</div>
        <div style="font-size: 9px; color: var(--text-secondary); line-height: 1.8; margin-top: 8px;">
          <strong>${escapeHtml(invoice.client_name)}</strong><br>
          ${escapeHtml(invoice.client_email)}<br>
          <strong>Mascota:</strong> ${escapeHtml(invoice.pet_name)}
        </div>
      </div>
    </div>
  `;

  const medicinesTable =
    medicines.length > 0
      ? `<div class="section-title">Medicinas</div>${buildReportTable<InvoiceMedicineLine>(
          [
            {
              header: 'Producto',
              render: (r) => escapeHtml(r.supply_name),
            },
            {
              header: 'Cant.',
              render: (r) => r.quantity.toString(),
              align: 'center',
            },
            {
              header: 'Precio Unit.',
              render: (r) =>
                `<span class="font-mono">${formatCurrency(r.unit_price)}</span>`,
              align: 'right',
            },
            {
              header: 'Desc. %',
              render: (r) =>
                `<span class="font-mono">${r.discount_percent.toFixed(0)}%</span>`,
              align: 'center',
            },
            {
              header: 'Final',
              render: (r) =>
                `<span class="font-mono" style="font-weight: 600;">${formatCurrency(r.final_price)}</span>`,
              align: 'right',
            },
          ],
          medicines,
        )}`
      : '';

  const servicesTable =
    services.length > 0
      ? `<div class="section-title">Servicios Adicionales</div>${buildReportTable<InvoiceServiceLine>(
          [
            {
              header: 'Servicio',
              render: (r) => escapeHtml(r.service_name),
            },
            {
              header: 'Precio Unit.',
              render: (r) =>
                `<span class="font-mono">${formatCurrency(r.unit_price)}</span>`,
              align: 'right',
            },
            {
              header: 'Desc. %',
              render: (r) =>
                `<span class="font-mono">${r.discount_percent.toFixed(0)}%</span>`,
              align: 'center',
            },
            {
              header: 'Final',
              render: (r) =>
                `<span class="font-mono" style="font-weight: 600;">${formatCurrency(r.final_price)}</span>`,
              align: 'right',
            },
          ],
          services,
        )}`
      : '';

  const inventoryTable =
    inventoryItems.length > 0
      ? `<div class="section-title">Items de Inventario</div>${buildReportTable<InvoiceInventoryLine>(
          [
            {
              header: 'Producto',
              render: (r) => escapeHtml(r.supply_name),
            },
            {
              header: 'Cant.',
              render: (r) => r.quantity.toString(),
              align: 'center',
            },
            {
              header: 'Precio Unit.',
              render: (r) =>
                `<span class="font-mono">${formatCurrency(r.unit_price)}</span>`,
              align: 'right',
            },
            {
              header: 'Desc. %',
              render: (r) =>
                `<span class="font-mono">${r.discount_percent.toFixed(0)}%</span>`,
              align: 'center',
            },
            {
              header: 'Final',
              render: (r) =>
                `<span class="font-mono" style="font-weight: 600;">${formatCurrency(r.final_price)}</span>`,
              align: 'right',
            },
          ],
          inventoryItems,
        )}`
      : '';

  const summary = `
    <div class="summary-container" style="margin-top: 24px;">
      <div class="summary-box">
        <span class="summary-label">Subtotal</span>
        <span class="summary-value">${formatCurrency(invoice.subtotal_unpaid)}<span class="summary-currency">USD</span></span>
      </div>
      <div class="summary-box summary-box-accent-warning">
        <span class="summary-label">Descuentos</span>
        <span class="summary-value">${formatCurrency(invoice.discount_total)}<span class="summary-currency">USD</span></span>
      </div>
      <div class="summary-box summary-box-accent-success">
        <span class="summary-label">Total</span>
        <span class="summary-value">${formatCurrency(invoice.total_amount)}<span class="summary-currency">USD</span></span>
      </div>
    </div>
    <div class="summary-container" style="margin-top: 14px;">
      <div class="summary-box">
        <span class="summary-label">Pagado</span>
        <span class="summary-value">${formatCurrency(invoice.paid_amount)}<span class="summary-currency">USD</span></span>
      </div>
      <div class="summary-box summary-box-accent-neutral">
        <span class="summary-label">Pendiente</span>
        <span class="summary-value">${formatCurrency(invoice.remaining_amount)}<span class="summary-currency">USD</span></span>
      </div>
    </div>
  `;

  const content = `${headerInfo}${medicinesTable}${servicesTable}${inventoryTable}${summary}`;

  return wrapReport(
    content,
    'Factura',
    `N.º ${escapeHtml(invoice.invoice_number)}`,
    '',
  );
}
