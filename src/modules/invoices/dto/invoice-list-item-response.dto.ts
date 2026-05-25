export class InvoiceListItemResponseDto {
  id!: number;
  appointment_id!: number;
  invoice_number!: string;
  status!: string;
  total_amount!: number;
  remaining_amount!: number;
  paid_at!: Date | null;
  created_at!: Date;
}
