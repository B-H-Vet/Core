import { Module } from '@nestjs/common';

import { MeasurementUnitsController } from './controllers/measurement-units.controller';
import { MeasurementUnitRepository } from './repositories/measurement-unit.repository';
import { IMeasurementUnitRepository } from './repositories/measurement-unit.repository.interface';
import { MeasurementUnitsService } from './services/measurement-units.service';

@Module({
  controllers: [MeasurementUnitsController],
  providers: [
    MeasurementUnitsService,
    {
      provide: IMeasurementUnitRepository,
      useClass: MeasurementUnitRepository,
    },
  ],
  exports: [MeasurementUnitsService, IMeasurementUnitRepository],
})
export class MeasurementUnitsModule {}
