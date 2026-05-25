import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @IsInt()
  @IsNotEmpty()
  appointment_id!: number;
}
