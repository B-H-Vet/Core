export interface PendingInvoiceAppointment {
  id: number;
  date: Date;
  end_date: Date;
  client_id: number;
  client_name: string;
  pet_id: number;
  pet_name: string;
  vet_id: number;
  vet_name: string;
  service_total: number;
  has_prescribed_medicines: boolean;
}

export const APPOINTMENT_INVOICE_QUERY_REPOSITORY =
  'APPOINTMENT_INVOICE_QUERY_REPOSITORY';

export abstract class IAppointmentInvoiceQueryRepository {
  abstract findPendingInvoice(pagination: {
    page: number;
    limit: number;
  }): Promise<PendingInvoiceAppointment[]>;

  abstract countPendingInvoice(): Promise<number>;
}
