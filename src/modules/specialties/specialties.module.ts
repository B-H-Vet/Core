import { Module } from '@nestjs/common';

import { SpecialtiesController } from './controllers/specialties.controller';
import { SpecialtyRepository } from './repositories/specialty.repository';
import { SPECIALTY_REPOSITORY } from './repositories/specialty.repository.interface';
import { SpecialtiesService } from './services/specialties.service';

@Module({
  imports: [],
  controllers: [SpecialtiesController],
  providers: [
    SpecialtiesService,
    {
      provide: SPECIALTY_REPOSITORY,
      useClass: SpecialtyRepository,
    },
  ],
  exports: [SpecialtiesService, SPECIALTY_REPOSITORY],
})
export class SpecialtiesModule {}
