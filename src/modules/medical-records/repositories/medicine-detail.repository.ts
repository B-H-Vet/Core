import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  medicineDetails,
  type MedicineDetail,
} from '../../../database/schema/medical-records/medicine-details.schema';

import {
  CreateMedicineDetailInput,
  IMedicineDetailRepository,
} from './medicine-detail.repository.interface';

@Injectable()
export class MedicineDetailRepository extends IMedicineDetailRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async createMany(data: CreateMedicineDetailInput[]): Promise<void> {
    if (data.length === 0) return;

    await this.db.insert(medicineDetails).values(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );
  }

  async findByMedicalRecordId(
    medicalRecordId: number,
  ): Promise<MedicineDetail[]> {
    return this.db
      .select()
      .from(medicineDetails)
      .where(eq(medicineDetails.medical_record_id, medicalRecordId));
  }
}
