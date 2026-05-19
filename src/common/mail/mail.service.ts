import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendVerificationCode(
    correo: string,
    nombreCompleto: string,
    codigo: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"B&H Veterinary" <${process.env.MAIL_USER}>`,
      to: correo,
      subject: 'Código de verificación',
      html: `
        <h2>Bienvenido a B&H Veterinary, ${nombreCompleto}</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="letter-spacing: 8px;">${codigo}</h1>
        <p>Este código expira en <strong>10 minutos</strong>.</p>
      `,
    });
  }
}
