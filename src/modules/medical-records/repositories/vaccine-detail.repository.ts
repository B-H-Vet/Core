import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import {
  vaccineDetails,
  type VaccineDetail,
} from '../../../database/schema/medical-records/vaccine-details.schema';

import {
  CreateVaccineDetailInput,
  IVaccineDetailRepository,
} from './vaccine-detail.repository.interface';

@Injectable()
export class VaccineDetailRepository extends IVaccineDetailRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async createMany(data: CreateVaccineDetailInput[]): Promise<void> {
    if (data.length === 0) return;

    await this.db.insert(vaccineDetails).values(
      data.map((item) => ({
        ...item,
        created_at: new Date(),
        updated_at: new Date(),
      })),
    );
  }

  async findByMedicalRecordId(
    medicalRecordId: number,
  ): Promise<VaccineDetail[]> {
    return this.db
      .select()
      .from(vaccineDetails)
      .where(eq(vaccineDetails.medical_record_id, medicalRecordId));
  }
}
