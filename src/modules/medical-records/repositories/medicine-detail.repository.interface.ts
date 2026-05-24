import type { MedicineDetail } from '../../../database/schema/medical-records/medicine-details.schema';

export const MEDICINE_DETAIL_REPOSITORY = 'MEDICINE_DETAIL_REPOSITORY';

export interface CreateMedicineDetailInput {
  medical_record_id: number;
  supply_id: number;
  dose: string;
  duration: string;
}

export abstract class IMedicineDetailRepository {
  abstract createMany(data: CreateMedicineDetailInput[]): Promise<void>;
  abstract findByMedicalRecordId(
    medicalRecordId: number,
  ): Promise<MedicineDetail[]>;
}
