import { Module } from '@nestjs/common';

import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';

import { PaymentRepository } from './repositories/payment.repository';
import { PAYMENT_REPOSITORY } from './repositories/payment.repository.interface';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    {
      provide: PAYMENT_REPOSITORY,
      useClass: PaymentRepository,
    },
  ],
  exports: [
    PaymentsService,
    PAYMENT_REPOSITORY,
  ],
})
export class PaymentsModule {}