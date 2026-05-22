import { Module } from '@nestjs/common';

import { ClientsModule } from '../clients/clients.module';

import { PetsController } from './controllers/pets.controller';
import { PetRepository } from './repositories/pet.repository';
import { PET_REPOSITORY } from './repositories/pet.repository.interface';
import { PetsService } from './services/pets.service';

@Module({
  imports: [ClientsModule],
  controllers: [PetsController],
  providers: [
    PetsService,
    {
      provide: PET_REPOSITORY,
      useClass: PetRepository,
    },
  ],
  exports: [PetsService, PET_REPOSITORY],
})
export class PetsModule {}
