import { Module } from '@nestjs/common';

import { CategoriesModule } from '../categories/categories.module';
import { MeasurementUnitsModule } from '../measurement-units/measurement-units.module';

import { SuppliesController } from './controllers/supplies.controller';
import { SupplyRepository } from './repositories/supply.repository';
import { ISupplyRepository } from './repositories/supply.repository.interface';
import { SuppliesService } from './services/supplies.service';

@Module({
  imports: [CategoriesModule, MeasurementUnitsModule],
  controllers: [SuppliesController],
  providers: [
    SuppliesService,
    {
      provide: ISupplyRepository,
      useClass: SupplyRepository,
    },
  ],
  exports: [SuppliesService, ISupplyRepository],
})
export class SuppliesModule {}
