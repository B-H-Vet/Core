import { wrapReport } from '../base/layout';

import { operationsHistoryStyles } from './operations-history.styles';

export function buildOperationsHistoryTemplate(): string {
  return wrapReport(
    '<p>Historial de operaciones - En construcción</p>',
    'Historial de operaciones',
    undefined,
    operationsHistoryStyles,
  );
}
