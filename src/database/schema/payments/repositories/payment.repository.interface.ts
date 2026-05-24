import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../payments.schema';

export const PAYMENT_REPOSITORY = 'PAYMENT_REPOSITORY';

export interface CreatePaymentInput {
  user_id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_reference?: string | null;
}

export abstract class IPaymentRepository {
  abstract create(data: CreatePaymentInput): Promise<Payment>;
  abstract findById(id: number): Promise<Payment | null>;
  abstract findApprovedById(id: number): Promise<Payment | null>;
}