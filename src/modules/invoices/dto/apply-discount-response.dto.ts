export class ApplyDiscountResponseDto {
  id!: number;
  item_type!: 'medicine' | 'additional_service' | 'inventory_item';
  discount_percent!: number;
  final_price!: number;
  updated_totals!: {
    subtotal_unpaid: number;
    discount_total: number;
    total_amount: number;
    remaining_amount: number;
  };
}
