import type { PaymentConfirmationEmailData } from './email.types';

export function buildPaymentConfirmationHtml(
  data: PaymentConfirmationEmailData,
): string {
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(data.appointmentDate);

  return `
    <h2>Pago confirmado</h2>

    <p>El pago de su cita veterinaria fue procesado exitosamente. Su cita ahora está confirmada.</p>

    <p><strong>Mascota:</strong> ${data.petName}</p>
    <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
    <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
    <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>
    <p><strong>Total pagado:</strong> $${data.total.toLocaleString('es-CO')}</p>

    <p style="margin-top:24px;">Recuerde llegar con 10 minutos de anticipación.</p>

    <p>Breaze & Harold Veterinary System</p>
  `;
}
