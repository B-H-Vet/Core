import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { MailService } from '../../../common/mail/mail.service';
import {
  InvoicePaymentConfirmationEmailData,
  InvoicePaymentRequestEmailData,
} from '../templates/invoice-mail.types';
import { buildInvoicePaymentConfirmationHtml } from '../templates/invoice-payment-confirmation.template';
import { buildInvoicePaymentRequestHtml } from '../templates/invoice-payment-request.template';

@Injectable()
export class InvoiceMailService {
  constructor(private readonly mailService: MailService) {}

  async sendPaymentRequest(
    to: string,
    data: InvoicePaymentRequestEmailData,
  ): Promise<void> {
    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to,
        subject: 'Pago de factura — Breaze & Harold Veterinary System',
        html: buildInvoicePaymentRequestHtml(data),
      });
    } catch {
      throw new InternalServerErrorException(
        'No se pudo enviar el correo con el enlace de pago',
      );
    }
  }

  async sendPaymentConfirmation(
    to: string,
    data: InvoicePaymentConfirmationEmailData,
    pdfBuffer: Buffer,
  ): Promise<void> {
    try {
      await this.mailService.sendMail({
        from: `"Breaze & Harold Veterinary System" <${process.env.MAIL_FROM ?? ''}>`,
        to,
        subject: 'Confirmación de pago — Factura pagada',
        html: buildInvoicePaymentConfirmationHtml(data),
        attachments: [
          {
            filename: `factura-${data.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch {
      throw new InternalServerErrorException(
        'El pago fue registrado, pero no se pudo enviar el correo de confirmación',
      );
    }
  }
}
