export const APPOINTMENT_INFO_REPOSITORY = 'APPOINTMENT_INFO_REPOSITORY';

export interface AppointmentEmailInfo {
  clientEmail: string;
  clientName: string;
  clientPhone: string | null;
  petName: string;
  vetName: string;
}

export abstract class IAppointmentInfoRepository {
  abstract getAppointmentEmailInfo(data: {
    userId: number;
    petId: number;
    vetId: number;
  }): Promise<AppointmentEmailInfo | null>;
}
