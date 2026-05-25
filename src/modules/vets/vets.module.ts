import { Module } from '@nestjs/common';

import { SpecialtiesModule } from './specialties/specialties.module';
import { VetModule } from './vet/vet.module';
import { VetSpecialtiesModule } from './vet-specialties/vet-specialties.module';
import { VetsRepositoriesModule } from './vets-repositories.module';

@Module({
  imports: [
    VetsRepositoriesModule,
    VetModule,
    VetSpecialtiesModule,
    SpecialtiesModule,
  ],
  exports: [
    VetsRepositoriesModule,
    VetModule,
    VetSpecialtiesModule,
    SpecialtiesModule,
  ],
})
export class VetsModule {}
