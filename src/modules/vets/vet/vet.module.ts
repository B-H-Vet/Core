import { Module } from '@nestjs/common';

import { UsersModule } from '../../users/users.module';
import { VetSpecialtiesModule } from '../vet-specialties/vet-specialties.module';
import { VetsRepositoriesModule } from '../vets-repositories.module';

import { VetController } from './controllers/vet.controller';
import { VetService } from './services/vet.service';

@Module({
  imports: [UsersModule, VetSpecialtiesModule, VetsRepositoriesModule],
  controllers: [VetController],
  providers: [VetService],
  exports: [VetService],
})
export class VetModule {}
