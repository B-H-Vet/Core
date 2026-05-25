import { escapeHtml } from '../base/layout';

export interface TableColumn<T> {
  header: string;
  render: (row: T) => string;
  align?: 'left' | 'center' | 'right';
}

export interface TableRowConfig<T> {
  rowClass?: (row: T) => string | undefined;
}

function getAlignClass(align: TableColumn<unknown>['align']): string {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return '';
}

export function buildReportTable<T>(
  columns: TableColumn<T>[],
  rows: T[],
  config?: TableRowConfig<T>,
): string {
  const headers = columns
    .map((c) => {
      const alignClass = getAlignClass(c.align);
      return `<th class="${alignClass}">${escapeHtml(c.header)}</th>`;
    })
    .join('');

  const bodyRows = rows
    .map((r) => {
      const rowClass = config?.rowClass?.(r) ?? '';
      const cells = columns
        .map((c) => {
          const alignClass = getAlignClass(c.align);
          return `<td class="${alignClass}">${c.render(r)}</td>`;
        })
        .join('');
      return `<tr class="${rowClass}">${cells}</tr>`;
    })
    .join('');

  return `
    <div class="table-wrapper">
      <table>
        <thead><tr>${headers}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>
  `;
}
