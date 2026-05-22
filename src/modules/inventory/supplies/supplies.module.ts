import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { MeasurementUnitsModule } from '../measurement-units/measurement-units.module';

import { SuppliesController } from './controllers/supplies.controller';
import { SupplyRepository } from './repositories/supply.repository';
import { SUPPLY_REPOSITORY } from './repositories/supply.repository.interface';
import { SuppliesService } from './services/supplies.service';

@Module({
  imports: [CategoriesModule, MeasurementUnitsModule],
  controllers: [SuppliesController],
  providers: [
    SuppliesService,
    {
      provide: SUPPLY_REPOSITORY,
      useClass: SupplyRepository,
    },
  ],
  exports: [SuppliesService, SUPPLY_REPOSITORY],
})
export class SuppliesModule {}
