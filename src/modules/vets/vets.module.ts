import { Module } from '@nestjs/common';
import { VetRepository } from './repositories/vet.repository';
import { VET_REPOSITORY } from './repositories/vet.repository.interface';
import { VetsController } from './controllers/vets.controller';
import { VetsService } from './services/vets.service';
import { UsersModule } from '../users/users.module';
import { SpecialtiesModule } from '../specialties/specialties.module';

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