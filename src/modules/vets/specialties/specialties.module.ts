import { Module } from '@nestjs/common';

import { VetsRepositoriesModule } from '../vets-repositories.module';

import { SpecialtiesController } from './controllers/specialties.controller';
import { SpecialtiesService } from './services/specialties.service';

@Module({
  imports: [VetsRepositoriesModule],
  controllers: [SpecialtiesController],
  providers: [SpecialtiesService],
  exports: [SpecialtiesService],
})
export class SpecialtiesModule {}
