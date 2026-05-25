import type { CancellationEmailData } from './email.types';

export function buildCancellationHtml(data: CancellationEmailData): string {
  const formattedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(data.appointmentDate);

  return `
    <h2>Cita cancelada</h2>

    <p>Su cita veterinaria fue cancelada. A continuación los detalles:</p>

    <p><strong>Mascota:</strong> ${data.petName}</p>
    <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
    <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
    <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>
    <p><strong>Motivo de cancelación:</strong> ${data.cancelReason}</p>

    <p style="margin-top:24px;">Si desea reagendar, puede hacerlo a través de nuestro sistema o contactando a la recepción.</p>

    <p>Breaze & Harold Veterinary System</p>
  `;
}
