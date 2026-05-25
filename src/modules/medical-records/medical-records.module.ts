import { Module } from '@nestjs/common';

import { SuppliesModule } from '../inventory/supplies/supplies.module';
import { VetsRepositoriesModule } from '../vets/vets-repositories.module';

import { MedicalRecordsController } from './controllers/medical-records.controller';
import { MedicalRecordRepository } from './repositories/medical-record.repository';
import { MEDICAL_RECORD_REPOSITORY } from './repositories/medical-record.repository.interface';
import { MedicineDetailRepository } from './repositories/medicine-detail.repository';
import { MEDICINE_DETAIL_REPOSITORY } from './repositories/medicine-detail.repository.interface';
import { PetWeightRepository } from './repositories/pet-weight.repository';
import { PET_WEIGHT_REPOSITORY } from './repositories/pet-weight.repository.interface';
import { VaccineDetailRepository } from './repositories/vaccine-detail.repository';
import { VACCINE_DETAIL_REPOSITORY } from './repositories/vaccine-detail.repository.interface';
import { MedicalRecordsService } from './services/medical-records.service';

@Module({
  imports: [SuppliesModule, VetsRepositoriesModule],
  controllers: [MedicalRecordsController],
  providers: [
    MedicalRecordsService,
    {
      provide: MEDICAL_RECORD_REPOSITORY,
      useClass: MedicalRecordRepository,
    },
    {
      provide: MEDICINE_DETAIL_REPOSITORY,
      useClass: MedicineDetailRepository,
    },
    {
      provide: VACCINE_DETAIL_REPOSITORY,
      useClass: VaccineDetailRepository,
    },
    {
      provide: PET_WEIGHT_REPOSITORY,
      useClass: PetWeightRepository,
    },
  ],
  exports: [
    MedicalRecordsService,
    MEDICAL_RECORD_REPOSITORY,
    MEDICINE_DETAIL_REPOSITORY,
    VACCINE_DETAIL_REPOSITORY,
    PET_WEIGHT_REPOSITORY,
  ],
})
export class MedicalRecordsModule {}
