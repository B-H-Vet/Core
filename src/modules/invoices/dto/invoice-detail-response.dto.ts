import type {
  InvoiceMedicineItemDto,
  InvoiceAdditionalServiceItemDto,
  InvoiceInventoryItemDto,
} from './create-invoice-response.dto';

export class InvoiceDetailResponseDto {
  id!: number;
  appointment_id!: number;
  invoice_number!: string;
  status!: string;
  paid_amount!: number;
  subtotal_unpaid!: number;
  discount_total!: number;
  total_amount!: number;
  remaining_amount!: number;
  paid_at!: Date | null;
  cancellation_reason!: string | null;
  cancelled_at!: Date | null;
  medicines!: InvoiceMedicineItemDto[];
  additional_services!: InvoiceAdditionalServiceItemDto[];
  inventory_items!: InvoiceInventoryItemDto[];
  created_at!: Date;
  updated_at!: Date;
}
