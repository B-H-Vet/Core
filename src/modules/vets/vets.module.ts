import { Module } from '@nestjs/common';

import { SpecialtiesModule } from '../specialties/specialties.module';
import { UsersModule } from '../users/users.module';

import { VetsController } from './controllers/vets.controller';
import { VetRepository } from './repositories/vet.repository';
import { VET_REPOSITORY } from './repositories/vet.repository.interface';
import { VetsService } from './services/vets.service';

@Module({
  imports: [UsersModule, SpecialtiesModule],
  controllers: [VetsController],
  providers: [
    VetsService,
    {
      provide: VET_REPOSITORY,
      useClass: VetRepository,
    },
  ],
  exports: [VetsService, VET_REPOSITORY],
})
export class VetsModule {}
