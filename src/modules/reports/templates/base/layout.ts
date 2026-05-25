import { baseStyles } from './styles';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function wrapReport(
  content: string,
  title: string,
  subtitle?: string,
  additionalStyles?: string,
): string {
  const now = new Date();

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        ${baseStyles}
        ${additionalStyles ? `<style>${additionalStyles}</style>` : ''}
      </head>
      <body>
        <div class="report-header">
          <div class="report-header-left">
            <div class="report-header-accent"></div>
            <div class="report-header-text">
              <h1>${escapeHtml(title)}</h1>
              ${subtitle ? `<h2>${escapeHtml(subtitle)}</h2>` : ''}
            </div>
          </div>
          <div class="report-header-right">
            <div class="report-brand">Breaze & Harold</div>
            <div class="report-meta">
              <strong>Generado:</strong> ${formatDate(now)} ${formatTime(now)}
            </div>
          </div>
        </div>
        ${content}
        <div class="footer">
          <div class="footer-brand">Breaze & Harold Veterinary System</div>
          <div class="footer-meta">
            Documento generado el ${formatDate(now)} a las ${formatTime(now)}<br>
            Este reporte es confidencial y de uso interno.
          </div>
        </div>
      </body>
    </html>
  `;
}
