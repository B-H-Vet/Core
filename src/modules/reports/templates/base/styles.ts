export const baseStyles = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap');

    :root {
      --primary: #0d9488;
      --primary-dark: #0f766e;
      --primary-light: #ccfbf1;
      --primary-subtle: #f0fdfa;
      --text: #0f172a;
      --text-secondary: #475569;
      --text-muted: #94a3b8;
      --border: #e2e8f0;
      --border-light: #f1f5f9;
      --success: #059669;
      --success-light: #d1fae5;
      --warning: #d97706;
      --warning-light: #fef3c7;
      --danger: #dc2626;
      --danger-light: #fee2e2;
      --info: #0369a1;
      --info-light: #e0f2fe;
      --neutral: #64748b;
      --neutral-light: #f1f5f9;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 48px 56px;
      color: var(--text);
      line-height: 1.6;
      background: #ffffff;
      -webkit-font-smoothing: antialiased;
      font-size: 9.5px;
    }

    /* ===== HEADER / LETTERHEAD ===== */
    .report-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .report-header-left {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .report-header-accent {
      width: 4px;
      height: 48px;
      background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
      border-radius: 2px;
      flex-shrink: 0;
      margin-top: 4px;
    }

    .report-header-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    h1 {
      font-family: 'Figtree', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    h2 {
      font-family: 'Noto Sans', sans-serif;
      font-size: 11px;
      color: var(--text-secondary);
      font-weight: 400;
      letter-spacing: 0.1px;
    }

    .report-header-right {
      text-align: right;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .report-meta {
      font-size: 8.5px;
      color: var(--text-muted);
      font-weight: 400;
    }

    .report-meta strong {
      color: var(--text-secondary);
      font-weight: 600;
    }

    .report-brand {
      font-family: 'Figtree', sans-serif;
      font-size: 10px;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 4px;
    }

    /* ===== TABLES ===== */
    .table-wrapper {
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      margin-top: 4px;
    }

    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 9px;
    }

    thead {
      background: var(--primary-subtle);
    }

    th {
      color: var(--primary-dark);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 7.5px;
      padding: 11px 10px;
      text-align: left;
      border-bottom: 1.5px solid var(--primary);
      white-space: nowrap;
      font-family: 'Figtree', sans-serif;
    }

    td {
      padding: 9px 10px;
      border-bottom: 1px solid var(--border-light);
      vertical-align: middle;
      color: var(--text);
    }

    tbody tr:last-child td {
      border-bottom: none;
    }

    tbody tr:nth-child(even) {
      background-color: #fafafa;
    }

    /* ===== TEXT UTILITIES ===== */
    .text-right {
      text-align: right !important;
    }

    .text-center {
      text-align: center !important;
    }

    .text-muted {
      color: var(--text-muted);
    }

    .text-secondary {
      color: var(--text-secondary);
    }

    .font-mono {
      font-family: 'SF Mono', 'JetBrains Mono', Monaco, monospace;
      font-size: 8.5px;
      letter-spacing: -0.2px;
      color: var(--text-secondary);
    }

    /* ===== BADGES ===== */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 7.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      line-height: 1;
      white-space: nowrap;
    }

    .badge-neutral {
      background-color: var(--neutral-light);
      color: var(--neutral);
    }

    .badge-success {
      background-color: var(--success-light);
      color: var(--success);
    }

    .badge-warning {
      background-color: var(--warning-light);
      color: var(--warning);
    }

    .badge-danger {
      background-color: var(--danger-light);
      color: var(--danger);
    }

    .badge-info {
      background-color: var(--info-light);
      color: var(--info);
    }

    /* ===== ALERT DOTS ===== */
    .alert-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .alert-dot-warning {
      background-color: var(--warning);
    }

    .alert-dot-danger {
      background-color: var(--danger);
    }

    /* ===== CONDITIONAL ROWS ===== */
    .row-warning td {
      background-color: #fffbeb !important;
      border-bottom-color: #fde68a !important;
    }

    .row-danger td {
      background-color: #fef2f2 !important;
      border-bottom-color: #fecaca !important;
    }

    /* ===== SUMMARY BOXES ===== */
    .summary-container {
      margin-top: 28px;
      display: flex;
      gap: 14px;
    }

    .summary-box {
      flex: 1;
      padding: 18px 16px;
      border: 1px solid var(--border);
      border-radius: 6px;
      background: #ffffff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      position: relative;
      overflow: hidden;
    }

    .summary-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 3px;
      height: 100%;
      background: var(--primary);
    }

    .summary-box-accent-success::before {
      background: var(--success);
    }

    .summary-box-accent-warning::before {
      background: var(--warning);
    }

    .summary-box-accent-danger::before {
      background: var(--danger);
    }

    .summary-box-accent-neutral::before {
      background: var(--neutral);
    }

    .summary-label {
      font-size: 8px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 600;
      margin-bottom: 6px;
      display: block;
      font-family: 'Figtree', sans-serif;
    }

    .summary-value {
      font-size: 20px;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.5px;
      font-family: 'Figtree', sans-serif;
      line-height: 1.1;
    }

    .summary-sublabel {
      font-size: 8px;
      color: var(--text-muted);
      margin-top: 4px;
      font-weight: 400;
    }

    .summary-currency {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 500;
      margin-left: 2px;
    }

    /* ===== FOOTER ===== */
    .footer {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-brand {
      font-family: 'Figtree', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: var(--primary);
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }

    .footer-meta {
      font-size: 7.5px;
      color: var(--text-muted);
      text-align: right;
    }

    /* ===== INFO BOX ===== */
    .info-box {
      margin-top: 20px;
      padding: 12px 14px;
      background: var(--primary-subtle);
      border: 1px solid #ccfbf1;
      border-radius: 6px;
      font-size: 8.5px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .info-box strong {
      color: var(--primary-dark);
      font-weight: 600;
    }

    /* ===== SECTION DIVIDER ===== */
    .section-title {
      font-family: 'Figtree', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 24px 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-light);
    }
  </style>
`;
