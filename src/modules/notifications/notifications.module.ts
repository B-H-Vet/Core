import { Module } from '@nestjs/common';

import { MailModule } from '../../common/mail/mail.module';
import { PdfModule } from '../../common/pdf/pdf.module';

import { EmailService } from './services/email.service';

@Module({
  imports: [MailModule, PdfModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
