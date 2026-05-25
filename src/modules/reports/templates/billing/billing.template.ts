import type { BillingReportRow } from '../../repositories/reports.repository.interface';
import { wrapReport, escapeHtml } from '../base/layout';
import { buildReportTable } from '../components/report-table.component';

import { billingStyles } from './billing.styles';

function getStatusBadge(status: string): string {
  const normalized = status.toLowerCase().trim();

  if (normalized === 'pagada' || normalized === 'paid') {
    return '<span class="badge badge-success">Pagada</span>';
  }
  if (normalized === 'pendiente' || normalized === 'pending') {
    return '<span class="badge badge-warning">Pendiente</span>';
  }
  if (normalized === 'cancelada' || normalized === 'cancelled') {
    return '<span class="badge badge-danger">Cancelada</span>';
  }
  if (normalized === 'parcial' || normalized === 'partial') {
    return '<span class="badge badge-info">Parcial</span>';
  }

  return `<span class="badge badge-neutral">${escapeHtml(status)}</span>`;
}

export function buildBillingTemplate(
  rows: BillingReportRow[],
  subtitle?: string,
): string {
  const total = rows.reduce((acc, row) => acc + Number(row.total), 0);
  const paidTotal = rows
    .filter((r) => r.status.toLowerCase() === 'pagada')
    .reduce((acc, row) => acc + Number(row.total), 0);
  const pendingTotal = rows
    .filter((r) => r.status.toLowerCase() === 'pendiente')
    .reduce((acc, row) => acc + Number(row.total), 0);

  const fullSubtitle = subtitle ?? '';

  const table = buildReportTable<BillingReportRow>(
    [
      {
        header: 'Factura',
        render: (r) =>
          `<span class="font-mono">#${r.invoice_id.toString()}</span>`,
      },
      {
        header: 'Cita',
        render: (r) =>
          `<span class="font-mono text-muted">${r.appointment_id.toString()}</span>`,
        align: 'center',
      },
      {
        header: 'Subtotal',
        render: (r) =>
          `<span class="font-mono">${Number(r.subtotal).toFixed(2)}</span>`,
        align: 'right',
      },
      {
        header: 'Total',
        render: (r) =>
          `<span class="font-mono" style="font-weight: 600;">${Number(r.total).toFixed(2)}</span>`,
        align: 'right',
      },
      {
        header: 'Estado',
        render: (r) => getStatusBadge(r.status),
        align: 'center',
      },
      {
        header: 'Fecha',
        render: (r) => {
          const date = r.created_at.toISOString().split('T')[0] ?? '';
          return `<span class="font-mono text-muted">${date}</span>`;
        },
        align: 'center',
      },
    ],
    rows,
  );

  const summary = `
    <div class="summary-container">
      <div class="summary-box">
        <span class="summary-label">Total General del Periodo</span>
        <span class="summary-value">${total.toFixed(2)}<span class="summary-currency">USD</span></span>
      </div>
      <div class="summary-box summary-box-accent-success">
        <span class="summary-label">Total Pagado</span>
        <span class="summary-value">${paidTotal.toFixed(2)}<span class="summary-currency">USD</span></span>
      </div>
      <div class="summary-box summary-box-accent-warning">
        <span class="summary-label">Total Pendiente</span>
        <span class="summary-value">${pendingTotal.toFixed(2)}<span class="summary-currency">USD</span></span>
      </div>
    </div>
  `;

  const content = `<div class="billing-table">${table}</div>${summary}`;

  return wrapReport(
    content,
    'Reporte de Facturación',
    fullSubtitle,
    billingStyles,
  );
}
