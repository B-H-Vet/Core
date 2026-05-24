import { Module } from '@nestjs/common';

import { HospitalizationsController } from './controllers/hospitalizations.controller';
import { EvolutionNoteRepository } from './repositories/evolution-note.repository';
import { EVOLUTION_NOTE_REPOSITORY } from './repositories/evolution-note.repository.interface';
import { HospitalizationRepository } from './repositories/hospitalization.repository';
import { HOSPITALIZATION_REPOSITORY } from './repositories/hospitalization.repository.interface';
import { HospitalizationsService } from './services/hospitalizations.service';

@Module({
  controllers: [HospitalizationsController],
  providers: [
    HospitalizationsService,
    {
      provide: HOSPITALIZATION_REPOSITORY,
      useClass: HospitalizationRepository,
    },
    {
      provide: EVOLUTION_NOTE_REPOSITORY,
      useClass: EvolutionNoteRepository,
    },
  ],
  exports: [
    HospitalizationsService,
    HOSPITALIZATION_REPOSITORY,
    EVOLUTION_NOTE_REPOSITORY,
  ],
})
export class HospitalizationsModule {}
