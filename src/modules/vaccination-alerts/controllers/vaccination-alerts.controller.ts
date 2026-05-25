import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { VaccinationAlertQueryDto } from '../dto/vaccination-alert-query.dto';
import { VaccinationAlertsService } from '../services/vaccination-alerts.service';

@Controller('vaccination-alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL_NOMBRES.VETERINARIO, ROL_NOMBRES.RECEPCIONISTA)
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
