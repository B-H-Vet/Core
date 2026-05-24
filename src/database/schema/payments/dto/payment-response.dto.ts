export class PaymentResponseDto {
  id!: number;
  user_id!: number;
  amount!: string;
  method!: string;
  status!: string;
  transaction_reference!: string | null;
  created_at!: Date;
}