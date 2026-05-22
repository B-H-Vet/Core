import { Module } from '@nestjs/common';

import { MeasurementUnitsController } from './controllers/measurement-units.controller';
import { MeasurementUnitRepository } from './repositories/measurement-unit.repository';
import { MEASUREMENT_UNIT_REPOSITORY } from './repositories/measurement-unit.repository.interface';
import { MeasurementUnitsService } from './services/measurement-units.service';

@Module({
  controllers: [MeasurementUnitsController],
  providers: [
    MeasurementUnitsService,
    {
      provide: MEASUREMENT_UNIT_REPOSITORY,
      useClass: MeasurementUnitRepository,
    },
  ],
  exports: [MeasurementUnitsService, MEASUREMENT_UNIT_REPOSITORY],
})
export class MeasurementUnitsModule {}
