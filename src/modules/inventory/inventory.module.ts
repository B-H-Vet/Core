import { Module } from '@nestjs/common';
import { SupplyRepository } from './repositories/supply.repository';
import { CategoryRepository } from './repositories/category.repository';
import { MeasurementUnitRepository } from './repositories/measurement-unit.repository';
import { SUPPLY_REPOSITORY } from './repositories/supply.repository.interface';
import { CATEGORY_REPOSITORY } from './repositories/category.repository.interface';
import { MEASUREMENT_UNIT_REPOSITORY } from './repositories/measurement-unit.repository.interface';
import { MeasurementUnitsController } from './controllers/measurement-units.controller';
import { CategoriesController } from './controllers/categories.controller';
import { SuppliesController } from './controllers/supplies.controller';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [],
  controllers: [MeasurementUnitsController, CategoriesController, SuppliesController],
  providers: [
    InventoryService,
    {
      provide: SUPPLY_REPOSITORY,
      useClass: SupplyRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
    {
      provide: MEASUREMENT_UNIT_REPOSITORY,
      useClass: MeasurementUnitRepository,
    },
  ],
  exports: [InventoryService, SUPPLY_REPOSITORY, CATEGORY_REPOSITORY, MEASUREMENT_UNIT_REPOSITORY],
})
export class InventoryModule {}