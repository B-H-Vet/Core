export class InvoiceMedicineItemDto {
  id!: number;
  supply_name!: string;
  quantity!: number;
  unit_price!: number;
  discount_percent!: number;
  final_price!: number;
}

export class InvoiceAdditionalServiceItemDto {
  id!: number;
  service_name!: string;
  unit_price!: number;
  discount_percent!: number;
  final_price!: number;
}

export class InvoiceInventoryItemDto {
  id!: number;
  supply_name!: string;
  quantity!: number;
  unit_price!: number;
  discount_percent!: number;
  final_price!: number;
}

export class CreateInvoiceResponseDto {
  id!: number;
  appointment_id!: number;
  invoice_number!: string;
  status!: string;
  paid_amount!: number;
  subtotal_unpaid!: number;
  discount_total!: number;
  total_amount!: number;
  remaining_amount!: number;
  medicines!: InvoiceMedicineItemDto[];
  created_at!: Date;
}
