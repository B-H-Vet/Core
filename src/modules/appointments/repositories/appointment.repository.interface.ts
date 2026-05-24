import type {
  Appointment,
  AppointmentStatus,
} from '../../../database/schema/appointments/appointments.schema';

export const APPOINTMENT_REPOSITORY = 'APPOINTMENT_REPOSITORY';

export interface CreateAppointmentInput {
  user_id: number;
  vet_id: number;
  pet_id: number;
  date: Date;
}

export interface UpdateAppointmentStatusInput {
  id: number;
  status: AppointmentStatus;
  cancel_reason?: string | null;
  canceled_at?: Date | null;
  rescheduled_at?: Date | null;
  date?: Date;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export abstract class IAppointmentRepository {
  abstract create(data: CreateAppointmentInput): Promise<Appointment>;
  abstract findById(id: number): Promise<Appointment | null>;
  abstract findAll(pagination: PaginationParams): Promise<Appointment[]>;
  abstract count(): Promise<number>;

  abstract findVetConflict(
    vetId: number,
    date: Date,
    excludeAppointmentId?: number,
  ): Promise<Appointment | null>;

  abstract updateStatus(
    data: UpdateAppointmentStatusInput,
  ): Promise<Appointment>;

  abstract softDelete(id: number): Promise<void>;
}
