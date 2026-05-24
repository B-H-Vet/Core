export class AppointmentResponseDto {
  id!: number;
  user_id!: number;
  vet_id!: number;
  pet_id!: number;
  date!: Date;
  end_date!: Date;
  status!: string;
  invoice_number!: string | null;
  paid_at!: Date | null;
  total!: number;
  created_at!: Date;
}
