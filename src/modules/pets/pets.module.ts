import { Module } from '@nestjs/common';
import { PetRepository } from './repositories/pet.repository';
import { PET_REPOSITORY } from './repositories/pet.repository.interface';
import { PetsController } from './controllers/pets.controller';
import { PetsService } from './services/pets.service';
import { ClientsModule } from '../clients/clients.module';

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