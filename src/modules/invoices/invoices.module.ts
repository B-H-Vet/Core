import { Module } from '@nestjs/common';

import { MailModule } from '../../common/mail/mail.module';
import { PdfModule } from '../../common/pdf/pdf.module';

import { InvoicesController } from './controllers/invoices.controller';
import { InvoiceAdditionalServiceRepository } from './repositories/invoice-additional-service.repository';
import { INVOICE_ADDITIONAL_SERVICE_REPOSITORY } from './repositories/invoice-additional-service.repository.interface';
import { InvoiceInventoryItemRepository } from './repositories/invoice-inventory-item.repository';
import { INVOICE_INVENTORY_ITEM_REPOSITORY } from './repositories/invoice-inventory-item.repository.interface';
import { InvoiceMedicineDetailRepository } from './repositories/invoice-medicine-detail.repository';
import { INVOICE_MEDICINE_DETAIL_REPOSITORY } from './repositories/invoice-medicine-detail.repository.interface';
import { InvoiceQueryRepository } from './repositories/invoice-query.repository';
import { INVOICE_QUERY_REPOSITORY } from './repositories/invoice-query.repository.interface';
import { InvoiceRepository } from './repositories/invoice.repository';
import { INVOICE_REPOSITORY } from './repositories/invoice.repository.interface';
import { InvoiceCalculationService } from './services/invoice-calculation.service';
import { InvoiceMailService } from './services/invoice-mail.service';
import { InvoiceRedisService } from './services/invoice-redis.service';
import { InvoicesService } from './services/invoices.service';

@Module({
  imports: [MailModule, PdfModule],
  controllers: [InvoicesController],
  providers: [
    InvoicesService,
    InvoiceCalculationService,
    InvoiceRedisService,
    InvoiceMailService,
    {
      provide: INVOICE_REPOSITORY,
      useClass: InvoiceRepository,
    },
    {
      provide: INVOICE_ADDITIONAL_SERVICE_REPOSITORY,
      useClass: InvoiceAdditionalServiceRepository,
    },
    {
      provide: INVOICE_MEDICINE_DETAIL_REPOSITORY,
      useClass: InvoiceMedicineDetailRepository,
    },
    {
      provide: INVOICE_INVENTORY_ITEM_REPOSITORY,
      useClass: InvoiceInventoryItemRepository,
    },
    {
      provide: INVOICE_QUERY_REPOSITORY,
      useClass: InvoiceQueryRepository,
    },
  ],
  exports: [
    InvoicesService,
    INVOICE_REPOSITORY,
    INVOICE_ADDITIONAL_SERVICE_REPOSITORY,
    INVOICE_MEDICINE_DETAIL_REPOSITORY,
    INVOICE_INVENTORY_ITEM_REPOSITORY,
    INVOICE_QUERY_REPOSITORY,
  ],
})
export class InvoicesModule {}
