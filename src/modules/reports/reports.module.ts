import { Module } from '@nestjs/common';

import { ReportsController } from './controllers/reports.controller';
import { ReportsRepository } from './repositories/reports.repository';
import { REPORTS_REPOSITORY } from './repositories/reports.repository.interface';
import { PdfService } from './services/pdf.service';
import { ReportsService } from './services/reports.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    PdfService,
    {
      provide: REPORTS_REPOSITORY,
      useClass: ReportsRepository,
    },
  ],
  exports: [ReportsService, REPORTS_REPOSITORY],
})
export class ReportsModule {}
