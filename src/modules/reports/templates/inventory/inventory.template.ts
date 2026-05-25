import type { InventoryReportRow } from '../../repositories/reports.repository.interface';
import { wrapReport, escapeHtml } from '../base/layout';
import { buildReportTable } from '../components/report-table.component';

import { inventoryStyles } from './inventory.styles';

function getExpirationStatus(expiringDate: Date | null): {
  daysLeft: number | null;
  status: 'ok' | 'warning' | 'danger';
  label: string;
  rowClass: string;
} {
  if (!expiringDate) {
    return {
      daysLeft: null,
      status: 'ok',
      label: 'Sin vencimiento',
      rowClass: '',
    };
  }

  const now = new Date();
  const diffTime = expiringDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      daysLeft,
      status: 'danger',
      label: `Vencido (${Math.abs(daysLeft).toString()}d)`,
      rowClass: 'row-danger',
    };
  }

  if (daysLeft <= 7) {
    return {
      daysLeft,
      status: 'danger',
      label: `${daysLeft.toString()}d restantes`,
      rowClass: 'row-danger',
    };
  }

  if (daysLeft <= 30) {
    return {
      daysLeft,
      status: 'warning',
      label: `${daysLeft.toString()}d restantes`,
      rowClass: 'row-warning',
    };
  }

  return {
    daysLeft,
    status: 'ok',
    label: `${daysLeft.toString()}d restantes`,
    rowClass: '',
  };
}

function getStockStatus(
  stock: number,
  minStock: number,
): { label: string; badgeClass: string } {
  if (stock <= 0) {
    return { label: 'Sin stock', badgeClass: 'badge-danger' };
  }
  if (stock <= minStock) {
    return { label: 'Stock bajo', badgeClass: 'badge-warning' };
  }
  return { label: 'OK', badgeClass: 'badge-success' };
}

export function buildInventoryTemplate(rows: InventoryReportRow[]): string {
  const lowStockCount = rows.filter((r) => r.stock <= r.min_stock).length;
  const expiringCount = rows.filter((r) => {
    if (!r.expiring_date) return false;
    const daysLeft = Math.ceil(
      (new Date(r.expiring_date).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysLeft <= 30;
  }).length;

  const table = buildReportTable<InventoryReportRow>(
    [
      { header: 'ID', render: (r) => r.supply_id.toString(), align: 'center' },
      { header: 'Producto', render: (r) => escapeHtml(r.name) },
      {
        header: 'Stock',
        render: (r) => `<span class="font-mono">${r.stock.toString()}</span>`,
        align: 'center',
      },
      {
        header: 'Mín.',
        render: (r) =>
          `<span class="font-mono text-muted">${r.min_stock.toString()}</span>`,
        align: 'center',
      },
      {
        header: 'Precio',
        render: (r) =>
          `<span class="font-mono">${Number(r.price).toFixed(2)}</span>`,
        align: 'right',
      },
      {
        header: 'Vencimiento',
        render: (r) => {
          const exp = getExpirationStatus(
            r.expiring_date ? new Date(r.expiring_date) : null,
          );
          if (exp.status === 'ok') {
            return `<span class="badge badge-success">${exp.label}</span>`;
          }
          if (exp.status === 'warning') {
            return `<span class="badge badge-warning"><span class="alert-dot alert-dot-warning"></span>${exp.label}</span>`;
          }
          return `<span class="badge badge-danger"><span class="alert-dot alert-dot-danger"></span>${exp.label}</span>`;
        },
        align: 'center',
      },
      {
        header: 'Estado',
        render: (r) => {
          const stock = getStockStatus(r.stock, r.min_stock);
          return `<span class="badge ${stock.badgeClass}">${stock.label}</span>`;
        },
        align: 'center',
      },
    ],
    rows,
    {
      rowClass: (r) => {
        const exp = getExpirationStatus(
          r.expiring_date ? new Date(r.expiring_date) : null,
        );
        return exp.rowClass;
      },
    },
  );

  const summary = `
    <div class="summary-container">
      <div class="summary-box">
        <span class="summary-label">Total de Productos</span>
        <span class="summary-value">${rows.length.toString()}<span class="summary-currency">ítems</span></span>
      </div>
      <div class="summary-box ${lowStockCount > 0 ? 'summary-box-accent-danger' : 'summary-box-accent-success'}">
        <span class="summary-label">Stock Bajo</span>
        <span class="summary-value">${lowStockCount.toString()}</span>
      </div>
      <div class="summary-box ${expiringCount > 0 ? 'summary-box-accent-warning' : 'summary-box-accent-success'}">
        <span class="summary-label">Próximos a Vencer</span>
        <span class="summary-value">${expiringCount.toString()}</span>
      </div>
    </div>
  `;

  const content = `<div class="inventory-table">${table}</div>${summary}`;

  return wrapReport(
    content,
    'Reporte de Inventario',
    'Control de productos, stock, vencimientos y alertas operativas',
    inventoryStyles,
  );
}
