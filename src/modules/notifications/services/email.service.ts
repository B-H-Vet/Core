import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { MailService } from '../../../common/mail/mail.service';
import { PdfService } from '../../../common/pdf/pdf.service';
import { buildInvoiceHtml } from '../../appointments/invoice-template';
import {
  AppointmentConfirmationEmailData,
  PaymentConfirmationEmailData,
} from '../interfaces/email-confirmation.interface';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailService: MailService,
    private readonly pdfService: PdfService,
  ) {}

  async sendAppointmentConfirmation(
    data: AppointmentConfirmationEmailData,
  ): Promise<void> {
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

    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Factura de agendamiento de cita veterinaria',
        html: `
          <h2>Su cita fue agendada</h2>

          <p>Su cita veterinaria fue agendada correctamente. <strong>El pago es obligatorio para confirmar la cita.</strong></p>

          <p><strong>Mascota:</strong> ${data.petName}</p>
          <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
          <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>

          <h3>Servicios agendados</h3>
          <ul>${servicesList}</ul>
          <p><strong>Total a pagar:</strong> $${data.total.toLocaleString('es-CO')}</p>

          <div style="margin-top:16px;padding:12px;background:#e8f5e9;border-left:4px solid #4caf50;">
            <p><strong>Complete su pago aquí:</strong></p>
            <p><a href="${data.paymentLink}">${data.paymentLink}</a></p>
          </div>

          <p style="margin-top:24px;">Recuerde llegar con 10 minutos de anticipación.</p>

          <p>Breaze & Harold Veterinary System</p>
        `,
        attachments: [
          {
            filename: data.invoiceFileName,
            content: data.invoicePdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch {
      throw new InternalServerErrorException(
        'La cita fue creada, pero no se pudo enviar el correo de confirmación',
      );
    }
  }

  async sendPaymentConfirmation(
    data: PaymentConfirmationEmailData,
  ): Promise<void> {
    const formattedDate = new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(data.appointmentDate);

    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Confirmación de pago — Cita veterinaria',
        html: `
          <h2>Pago confirmado</h2>

          <p>El pago de su cita veterinaria fue procesado exitosamente. Su cita ahora está confirmada.</p>

          <p><strong>Mascota:</strong> ${data.petName}</p>
          <p><strong>Veterinario asignado:</strong> ${data.vetName}</p>
          <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          <p><strong>Dirección de la sede:</strong> ${data.clinicAddress}</p>
          <p><strong>Total pagado:</strong> $${data.total.toLocaleString('es-CO')}</p>

          <p style="margin-top:24px;">Recuerde llegar con 10 minutos de anticipación.</p>

          <p>Breaze & Harold Veterinary System</p>
        `,
      });
    } catch {
      throw new InternalServerErrorException(
        'El pago fue registrado, pero no se pudo enviar el correo de confirmación',
      );
    }
  }

  async generateInvoicePdf(
    data: Parameters<typeof buildInvoiceHtml>[0],
  ): Promise<Buffer> {
    const html = buildInvoiceHtml(data);
    return this.pdfService.renderFromHtml(html);
  }
}
