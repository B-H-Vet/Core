import { Module } from '@nestjs/common';

import { CategoriesModule } from './categories/categories.module';
import { MeasurementUnitsModule } from './measurement-units/measurement-units.module';
import { SuppliesModule } from './supplies/supplies.module';

@Module({
  imports: [CategoriesModule, MeasurementUnitsModule, SuppliesModule],
  exports: [CategoriesModule, MeasurementUnitsModule, SuppliesModule],
})
export class InventoryModule {}
