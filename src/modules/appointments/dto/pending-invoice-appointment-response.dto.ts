export class PendingInvoiceAppointmentResponseDto {
  id!: number;

  date!: Date;

  end_date!: Date;

  client_name!: string;

  pet_name!: string;

  vet_name!: string;

  service_total!: number;

  has_prescribed_medicines!: boolean;
}
