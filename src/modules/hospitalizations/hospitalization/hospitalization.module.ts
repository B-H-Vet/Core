import { Module } from '@nestjs/common';

import { ClientsModule } from '../../clients/clients.module';
import { PetsModule } from '../../pets/pets.module';
import { VetsModule } from '../../vets/vets.module';
import { EvolutionNotesModule } from '../evolution-notes/evolution-notes.module';
import { HospitalizationsRepositoriesModule } from '../hospitalizations-repositories.module';

import { HospitalizationsController } from './controllers/hospitalizations.controller';
import { HospitalizationsService } from './services/hospitalizations.service';

@Module({
  imports: [
    HospitalizationsRepositoriesModule,
    ClientsModule,
    PetsModule,
    VetsModule,
    EvolutionNotesModule,
  ],
  controllers: [HospitalizationsController],
  providers: [HospitalizationsService],
  exports: [HospitalizationsService],
})
export class HospitalizationModule {}
