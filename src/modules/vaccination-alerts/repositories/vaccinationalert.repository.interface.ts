export const VACCINATION_ALERT_REPOSITORY = 'VACCINATION_ALERT_REPOSITORY';
export interface VaccinationAlertRow {
  pet_id: number;
  pet_name: string;
  vaccine_id: number;
  vaccine_name: string;
  applied_date: Date;
  next_dose_date: Date;
  client_email: string;
}

export abstract class IVaccinationAlertRepository {
  abstract findUpcomingVaccines(days: number): Promise<VaccinationAlertRow[]>;
  abstract findExpiredVaccines(): Promise<VaccinationAlertRow[]>;
}
