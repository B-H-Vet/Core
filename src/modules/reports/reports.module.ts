import { Module } from '@nestjs/common';

import { PdfModule } from '../../common/pdf/pdf.module';

import { ReportsController } from './controllers/reports.controller';
import { ReportsRepository } from './repositories/reports.repository';
import { REPORTS_REPOSITORY } from './repositories/reports.repository.interface';
import { ReportTemplateService } from './services/report-template.service';
import { ReportsService } from './services/reports.service';

@Module({
  imports: [PdfModule],
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportTemplateService,
    {
      provide: REPORTS_REPOSITORY,
      useClass: ReportsRepository,
    },
  ],
  exports: [ReportsService, REPORTS_REPOSITORY],
})
export class ReportsModule {}
