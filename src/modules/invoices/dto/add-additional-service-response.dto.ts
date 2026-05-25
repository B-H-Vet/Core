export class AddAdditionalServiceResponseDto {
  id!: number;
  invoice_id!: number;
  service_name!: string;
  unit_price!: number;
  discount_percent!: number;
  final_price!: number;
  updated_totals!: {
    subtotal_unpaid: number;
    discount_total: number;
    total_amount: number;
    remaining_amount: number;
  };
}
