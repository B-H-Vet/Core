import type { AppointmentReportRow } from '../../repositories/reports.repository.interface';
import { wrapReport, escapeHtml } from '../base/layout';
import { buildReportTable } from '../components/report-table.component';

import { appointmentsStyles } from './appointments.styles';

function getStatusBadge(status: string): string {
  const normalized = status.toLowerCase().trim();

  if (normalized === 'completada' || normalized === 'completed') {
    return '<span class="badge badge-success">Completada</span>';
  }
  if (normalized === 'confirmada' || normalized === 'confirmed') {
    return '<span class="badge badge-info">Confirmada</span>';
  }
  if (normalized === 'pendiente' || normalized === 'pending') {
    return '<span class="badge badge-warning">Pendiente</span>';
  }
  if (normalized === 'cancelada' || normalized === 'cancelled') {
    return '<span class="badge badge-danger">Cancelada</span>';
  }
  if (normalized === 'no show' || normalized === 'noshow') {
    return '<span class="badge badge-neutral">No Show</span>';
  }

  return `<span class="badge badge-neutral">${escapeHtml(status)}</span>`;
}

export function buildAppointmentsTemplate(
  rows: AppointmentReportRow[],
  subtitle?: string,
): string {
  const completedCount = rows.filter(
    (r) => r.status.toLowerCase() === 'completada',
  ).length;
  const pendingCount = rows.filter(
    (r) => r.status.toLowerCase() === 'pendiente',
  ).length;
  const cancelledCount = rows.filter(
    (r) => r.status.toLowerCase() === 'cancelada',
  ).length;

  const table = buildReportTable<AppointmentReportRow>(
    [
      {
        header: 'ID',
        render: (r) =>
          `<span class="font-mono">${r.appointment_id.toString()}</span>`,
        align: 'center',
      },
      {
        header: 'Fecha',
        render: (r) => {
          const date = r.appointment_date.toISOString().split('T')[0] ?? '';
          const time = r.appointment_date.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          return `<span class="font-mono">${date}</span><br><span class="text-muted" style="font-size: 8px;">${time}</span>`;
        },
        align: 'center',
      },
      {
        header: 'Estado',
        render: (r) => getStatusBadge(r.status),
        align: 'center',
      },
      {
        header: 'Cliente',
        render: (r) => escapeHtml(r.client_email),
      },
      {
        header: 'Mascota',
        render: (r) =>
          `<span style="font-weight: 600;">${escapeHtml(r.pet_name)}</span>`,
      },
      {
        header: 'Veterinario',
        render: (r) => escapeHtml(r.vet_email),
      },
    ],
    rows,
  );

  const summary = `
    <div class="summary-container">
      <div class="summary-box">
        <span class="summary-label">Total de Citas</span>
        <span class="summary-value">${rows.length.toString()}<span class="summary-currency">citas</span></span>
      </div>
      <div class="summary-box summary-box-accent-success">
        <span class="summary-label">Completadas</span>
        <span class="summary-value">${completedCount.toString()}</span>
      </div>
      <div class="summary-box summary-box-accent-warning">
        <span class="summary-label">Pendientes</span>
        <span class="summary-value">${pendingCount.toString()}</span>
      </div>
      <div class="summary-box summary-box-accent-neutral">
        <span class="summary-label">Canceladas</span>
        <span class="summary-value">${cancelledCount.toString()}</span>
      </div>
    </div>
  `;

  const content = `<div class="appointments-table">${table}</div>${summary}`;

  return wrapReport(content, 'Reporte de Citas', subtitle, appointmentsStyles);
}
