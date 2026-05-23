import { Module } from '@nestjs/common';

import { VetsRepositoriesModule } from '../vets-repositories.module';

import { VetSpecialtiesController } from './controllers/vet-specialties.controller';
import { VetSpecialtiesService } from './services/vet-specialties.service';

@Module({
  imports: [VetsRepositoriesModule],
  controllers: [VetSpecialtiesController],
  providers: [VetSpecialtiesService],
  exports: [VetSpecialtiesService],
})
export class VetSpecialtiesModule {}
