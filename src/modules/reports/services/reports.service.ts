import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PdfService } from '../../../common/pdf/pdf.service';
import { ReportPeriodDto } from '../dto/report-period.dto';
import {
  IReportsRepository,
  REPORTS_REPOSITORY,
} from '../repositories/reports.repository.interface';

import { ReportTemplateService } from './report-template.service';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: IReportsRepository,

    private readonly pdfService: PdfService,
    private readonly reportTemplateService: ReportTemplateService,
  ) {}

  private parsePeriod(dto: ReportPeriodDto): {
    startDate: Date;
    endDate: Date;
    label: string;
  } {
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final',
      );
    }

    return {
      startDate,
      endDate,
      label: `Periodo: ${dto.start_date} - ${dto.end_date}`,
    };
  }

  async appointmentsByPeriod(dto: ReportPeriodDto): Promise<Buffer> {
    const period = this.parsePeriod(dto);

    const rows = await this.reportsRepository.findAppointmentsByPeriod(period);
    const html = this.reportTemplateService.appointmentsTemplate(
      rows,
      period.label,
    );

    return this.pdfService.renderFromHtml(html);
  }

  async billingByPeriod(dto: ReportPeriodDto): Promise<Buffer> {
    const period = this.parsePeriod(dto);

    const rows = await this.reportsRepository.findBillingByPeriod(period);
    const html = this.reportTemplateService.billingTemplate(rows, period.label);

    return this.pdfService.renderFromHtml(html);
  }

  async currentInventory(): Promise<Buffer> {
    const rows = await this.reportsRepository.findCurrentInventory();
    const html = this.reportTemplateService.inventoryTemplate(rows);

    return this.pdfService.renderFromHtml(html);
  }
}
