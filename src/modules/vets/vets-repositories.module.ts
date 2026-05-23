import { Module } from '@nestjs/common';

import { SpecialtyRepository } from './specialties/repositories/specialty.repository';
import { SPECIALTY_REPOSITORY } from './specialties/repositories/specialty.repository.interface';
import { VetRepository } from './vet/repositories/vet.repository';
import { VET_REPOSITORY } from './vet/repositories/vet.repository.interface';
import { VetSpecialtiesRepository } from './vet-specialties/repositories/vet-specialties.repository';
import { VET_SPECIALTIES_REPOSITORY } from './vet-specialties/repositories/vet-specialties.repository.interface';

@Module({
  providers: [
    {
      provide: VET_REPOSITORY,
      useClass: VetRepository,
    },
    {
      provide: VET_SPECIALTIES_REPOSITORY,
      useClass: VetSpecialtiesRepository,
    },
    {
      provide: SPECIALTY_REPOSITORY,
      useClass: SpecialtyRepository,
    },
  ],
  exports: [VET_REPOSITORY, VET_SPECIALTIES_REPOSITORY, SPECIALTY_REPOSITORY],
})
export class VetsRepositoriesModule {}
