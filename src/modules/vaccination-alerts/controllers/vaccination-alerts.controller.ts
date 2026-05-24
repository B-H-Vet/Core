import { Controller, Get, Query } from '@nestjs/common';

import { VaccinationAlertQueryDto } from '../dto/vaccination-alert-query.dto';
import { VaccinationAlertsService } from '../services/vaccination-alerts.service';

@Controller('vaccination-alerts')
export class VaccinationAlertsController {
  constructor(
    private readonly vaccinationAlertsService: VaccinationAlertsService,
  ) {}

  @Get('upcoming')
  findUpcoming(
    @Query()
    query: VaccinationAlertQueryDto,
  ) {
    return this.vaccinationAlertsService.findUpcoming(query.days ?? 7);
  }

  @Get('expired')
  findExpired() {
    return this.vaccinationAlertsService.findExpired();
  }
}
