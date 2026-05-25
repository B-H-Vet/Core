export class CancelInvoiceResponseDto {
  id!: number;
  status!: string;
  cancellation_reason!: string;
  cancelled_at!: Date;
  message!: string;
}
