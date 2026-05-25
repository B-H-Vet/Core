import type { VaccineDetail } from '../../../database/schema/medical-records/vaccine-details.schema';

export const VACCINE_DETAIL_REPOSITORY = 'VACCINE_DETAIL_REPOSITORY';

export interface CreateVaccineDetailInput {
  medical_record_id: number;
  supply_id: number;
  applied_date: Date;
  next_dose_date?: Date | null;
}

export abstract class IVaccineDetailRepository {
  abstract createMany(data: CreateVaccineDetailInput[]): Promise<void>;
  abstract findByMedicalRecordId(
    medicalRecordId: number,
  ): Promise<VaccineDetail[]>;
  abstract findExpiringSoon(from: Date, to: Date): Promise<VaccineDetail[]>;
}
