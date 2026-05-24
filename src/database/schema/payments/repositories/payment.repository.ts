import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database.module';

import {
  payments,
  type Payment,
} from '../payments.schema';

import {
  CreatePaymentInput,
  IPaymentRepository,
} from './payment.repository.interface';

@Injectable()
export class PaymentRepository extends IPaymentRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async create(data: CreatePaymentInput): Promise<Payment> {
    await this.db.insert(payments).values({
      user_id: data.user_id,
      amount: data.amount,
      method: data.method,
      status: data.status,
      transaction_reference: data.transaction_reference ?? null,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.user_id, data.user_id),
          eq(payments.amount, data.amount),
          eq(payments.status, data.status),
          isNull(payments.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new Error('Error al registrar el pago');
    }

    return result[0];
  }

  async findById(id: number): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(and(eq(payments.id, id), isNull(payments.deleted_at)))
      .limit(1);

    return result[0] ?? null;
  }

  async findApprovedById(id: number): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.id, id),
          eq(payments.status, 'APPROVED'),
          isNull(payments.deleted_at),
        ),
      )
      .limit(1);

    return result[0] ?? null;
  }
}