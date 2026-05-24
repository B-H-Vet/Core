import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { AppointmentConfirmationEmailData } from '../interfaces/email-confirmation.interface';

@Injectable()
export class EmailService {
  private readonly transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendAppointmentConfirmation(
    data: AppointmentConfirmationEmailData,
  ): Promise<void> {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(data.appointmentDate);

    try {
      await this.transporter.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Confirmación de cita veterinaria',
        html: `
          <h2>Su cita fue confirmada</h2>

          <p>Su cita veterinaria fue agendada correctamente.</p>

          <p><strong>Mascota:</strong> ${data.petName}</p>
          <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
          <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>

          <p>Recuerde llegar con 10 minutos de anticipacion.</p>

          <p>Breaze & Harold Veterinary System</p>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'La cita fue creada, pero no se pudo enviar el correo de confirmación',
      );
    }
  }
}
