import { Module } from '@nestjs/common';

import { VetsModule } from '../../vets/vets.module';
import { HospitalizationsRepositoriesModule } from '../hospitalizations-repositories.module';

import { EvolutionNotesController } from './controllers/evolution-notes.controller';
import { EvolutionNoteRepository } from './repositories/evolution-note.repository';
import { EVOLUTION_NOTE_REPOSITORY } from './repositories/evolution-note.repository.interface';
import { EvolutionNotesService } from './services/evolution-notes.service';

@Module({
  imports: [HospitalizationsRepositoriesModule, VetsModule],
  controllers: [EvolutionNotesController],
  providers: [
    EvolutionNotesService,
    {
      provide: EVOLUTION_NOTE_REPOSITORY,
      useClass: EvolutionNoteRepository,
    },
  ],
  exports: [EvolutionNotesService, EVOLUTION_NOTE_REPOSITORY],
})
export class EvolutionNotesModule {}
