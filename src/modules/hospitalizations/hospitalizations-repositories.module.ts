import { Module } from '@nestjs/common';

import { HospitalizationRepository } from './hospitalization/repositories/hospitalization.repository';
import { HOSPITALIZATION_REPOSITORY } from './hospitalization/repositories/hospitalization.repository.interface';

@Module({
  providers: [
    {
      provide: HOSPITALIZATION_REPOSITORY,
      useClass: HospitalizationRepository,
    },
  ],
  exports: [HOSPITALIZATION_REPOSITORY],
})
export class HospitalizationsRepositoriesModule {}
