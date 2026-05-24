import { Module } from '@nestjs/common';

import { VaccinationAlertsController } from './controllers/vaccination-alerts.controller';
import { VaccinationAlertRepository } from './repositories/vaccination-alert.repository';
import { VACCINATION_ALERT_REPOSITORY } from './repositories/vaccinationalert.repository.interface';
import { VaccinationAlertsService } from './services/vaccination-alerts.service';

@Module({
  controllers: [VaccinationAlertsController],

  providers: [
    VaccinationAlertsService,

    {
      provide: VACCINATION_ALERT_REPOSITORY,
      useClass: VaccinationAlertRepository,
    },
  ],

  exports: [VaccinationAlertsService, VACCINATION_ALERT_REPOSITORY],
})
export class VaccinationAlertsModule {}
