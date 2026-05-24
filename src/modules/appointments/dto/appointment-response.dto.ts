export class AppointmentResponseDto {
  id!: number;
  user_id!: number;
  vet_id!: number;
  pet_id!: number;
  date!: Date;
  status!: string;
  total!: number;
  created_at!: Date;
}
