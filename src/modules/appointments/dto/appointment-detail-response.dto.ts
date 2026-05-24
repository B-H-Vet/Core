export class AppointmentServiceResponseDto {
  service_id!: number;
  name!: string;
  unit_price!: string;
}

export class AppointmentDetailResponseDto {
  id!: number;
  user_id!: number;
  vet_id!: number;
  pet_id!: number;
  payment_id!: number;
  date!: Date;
  status!: string;
  cancel_reason!: string | null;
  canceled_at!: Date | null;
  rescheduled_at!: Date | null;
  created_at!: Date;
  updated_at!: Date;
  total!: number;
  services!: AppointmentServiceResponseDto[];
}
