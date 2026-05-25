import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { MailService } from '../../../common/mail/mail.service';
import { PdfService } from '../../../common/pdf/pdf.service';
import { buildAppointmentConfirmationHtml } from '../../appointments/templates/email-appointment.template';
import { buildCancellationHtml } from '../../appointments/templates/email-cancellation.template';
import { buildPaymentConfirmationHtml } from '../../appointments/templates/email-payment.template';
import { buildInvoiceHtml } from '../../appointments/templates/invoice.template';
import {
  AppointmentConfirmationEmailData,
  CancellationEmailData,
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
    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Factura de agendamiento de cita veterinaria',
        html: buildAppointmentConfirmationHtml(data),
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
    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Confirmación de pago — Cita veterinaria',
        html: buildPaymentConfirmationHtml(data),
      });
    } catch {
      throw new InternalServerErrorException(
        'El pago fue registrado, pero no se pudo enviar el correo de confirmación',
      );
    }
  }

  async sendCancellationNotification(
    data: CancellationEmailData,
  ): Promise<void> {
    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to: data.to,
        subject: 'Cancelación de cita — Breaze & Harold Veterinary System',
        html: buildCancellationHtml(data),
      });
    } catch {
      throw new InternalServerErrorException(
        'La cita fue cancelada, pero no se pudo enviar el correo de notificación',
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
