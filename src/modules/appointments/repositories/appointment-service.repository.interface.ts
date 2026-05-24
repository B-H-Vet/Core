export const APPOINTMENT_SERVICE_REPOSITORY = 'APPOINTMENT_SERVICE_REPOSITORY';

export interface CreateAppointmentServiceInput {
  appointment_id: number;
  service_id: number;
  unit_price: string;
}

export interface AppointmentServiceDetail {
  service_id: number;
  name: string;
  unit_price: string;
}

export abstract class IAppointmentServiceRepository {
  abstract createMany(data: CreateAppointmentServiceInput[]): Promise<void>;

  abstract findByAppointmentId(
    appointmentId: number,
  ): Promise<AppointmentServiceDetail[]>;

  abstract softDeleteByAppointmentId(appointmentId: number): Promise<void>;
}
