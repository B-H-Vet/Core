import type { AppointmentConfirmationEmailData } from './email.types';

export function buildAppointmentConfirmationHtml(
  data: AppointmentConfirmationEmailData,
): string {
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(data.appointmentDate);

  const servicesList = data.services
    .map(
      (s) =>
        `<li>${s.name} — ${String(s.durationMinutes)} min — $${s.unitPrice.toLocaleString('es-CO')}</li>`,
    )
    .join('');

  const hours = Math.floor(data.paymentExpirationMinutes / 60);
  const hourLabel = hours === 1 ? 'hora' : 'horas';
  const expirationText =
    data.paymentExpirationMinutes >= 60
      ? `${String(hours)} ${hourLabel}`
      : `${String(data.paymentExpirationMinutes)} minutos`;

  return `
    <h2>Su cita fue agendada</h2>

    <p>Su cita veterinaria fue agendada correctamente. <strong>El pago es obligatorio para confirmar la cita.</strong></p>

    <p><strong>Mascota:</strong> ${data.petName}</p>
    <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
    <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
    <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>

    <h3>Servicios agendados</h3>
    <ul>${servicesList}</ul>
    <p><strong>Total a pagar:</strong> $${data.total.toLocaleString('es-CO')}</p>

    <div style="margin-top:16px;padding:12px;background:#fff3e0;border-left:4px solid #ff9800;">
      <p><strong>Tiempo máximo de pago:</strong> ${expirationText}</p>
      <p>Pasado este tiempo, el enlace expirará y deberá agendar nuevamente.</p>
    </div>

    <div style="margin-top:16px;padding:12px;background:#e8f5e9;border-left:4px solid #4caf50;">
      <p><strong>Complete su pago aquí:</strong></p>
      <p><a href="${data.paymentLink}">${data.paymentLink}</a></p>
    </div>

    <p style="margin-top:24px;">Recuerde llegar con 10 minutos de anticipación.</p>

    <p>Breaze & Harold Veterinary System</p>
  `;
}
