import { Injectable } from '@nestjs/common';

import { MailService } from '../../../common/mail/mail.service';

@Injectable()
export class AuthMailService {
  constructor(private readonly mailService: MailService) {}

  async sendVerificationCode(
    email: string,
    fullName: string,
    code: string,
  ): Promise<void> {
    const transporter = this.mailService.getTransporter();
    await transporter.sendMail({
      from: `"B&H Veterinary" <${process.env.MAIL_USER ?? ''}>`,
      to: email,
      subject: 'Verification code',
      html: `
        <h2>Welcome to B&H Veterinary, ${fullName}</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 8px;">${code}</h1>
        <p>This code expires in <strong>10 minutes</strong>.</p>
      `,
    });
  }
}
