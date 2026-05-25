import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const secure = this.configService.get<string>('MAIL_SECURE') === 'true';
    const user = this.configService.get<string>('MAIL_USER');
    const pass =
      this.configService.get<string>('MAIL_PASS') ??
      this.configService.get<string>('MAIL_PASSWORD');

    if (!host || !port || !user || !pass) {
      throw new InternalServerErrorException(
        'Mail configuration is incomplete. Check MAIL_HOST, MAIL_PORT, MAIL_USER and MAIL_PASS/MAIL_PASSWORD env vars.',
      );
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  getTransporter(): nodemailer.Transporter {
    return this.transporter;
  }

  async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(options);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to send email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
