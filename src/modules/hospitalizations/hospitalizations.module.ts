import { Module } from '@nestjs/common';

import { EvolutionNotesModule } from './evolution-notes/evolution-notes.module';
import { HospitalizationModule } from './hospitalization/hospitalization.module';

@Module({
  imports: [HospitalizationModule, EvolutionNotesModule],
  exports: [HospitalizationModule, EvolutionNotesModule],
})
export class HospitalizationsModule {}
