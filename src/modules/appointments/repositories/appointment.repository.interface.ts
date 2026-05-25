import type {
  Appointment,
  AppointmentStatus,
} from '../../../database/schema/appointments/appointments.schema';

export const APPOINTMENT_REPOSITORY = 'APPOINTMENT_REPOSITORY';

export interface CreateAppointmentInput {
  client_id: number;
  vet_id: number;
  pet_id: number;
  date: Date;
  end_date: Date;
  invoice_number?: string;
  paid_at?: Date;
}

export interface UpdateAppointmentStatusInput {
  id: number;
  status: AppointmentStatus;
  cancel_reason?: string | null;
  canceled_at?: Date | null;
  rescheduled_at?: Date | null;
  date?: Date;
  end_date?: Date;
  paid_at?: Date | null;
  invoice_number?: string | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IAppointmentRepository {
  abstract create(data: CreateAppointmentInput): Promise<Appointment>;
  abstract findById(id: number): Promise<Appointment | null>;
  abstract findAll(pagination: PaginationParams): Promise<Appointment[]>;
  abstract findByClientId(
    clientId: number,
    pagination: PaginationParams,
  ): Promise<Appointment[]>;
  abstract findByVetId(
    vetId: number,
    pagination: PaginationParams,
  ): Promise<Appointment[]>;
  abstract count(): Promise<number>;
  abstract countByClientId(clientId: number): Promise<number>;
  abstract countByVetId(vetId: number): Promise<number>;

  abstract findVetConflict(
    vetId: number,
    startDate: Date,
    endDate: Date,
    excludeAppointmentId?: number,
  ): Promise<Appointment | null>;

  abstract updateStatus(
    data: UpdateAppointmentStatusInput,
  ): Promise<Appointment>;

  abstract softDelete(id: number): Promise<void>;
}
