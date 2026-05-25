import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ReportPeriodDto } from '../dto/report-period.dto';
import { ReportsService } from '../services/reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(ROL_NOMBRES.ADMINISTRADOR)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('appointments')
  async appointmentsByPeriod(
    @Query() query: ReportPeriodDto,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.appointmentsByPeriod(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-citas.pdf"',
    });
    return res.send(pdf);
  }

  @Get('billing')
  async billingByPeriod(@Query() query: ReportPeriodDto, @Res() res: Response) {
    const pdf = await this.reportsService.billingByPeriod(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-facturacion.pdf"',
    });
    return res.send(pdf);
  }

  @Get('inventory')
  async currentInventory(@Res() res: Response) {
    const pdf = await this.reportsService.currentInventory();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="reporte-inventario.pdf"',
    });
    return res.send(pdf);
  }
}
