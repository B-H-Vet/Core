import { Injectable } from '@nestjs/common';

import {
  AppointmentReportRow,
  BillingReportRow,
  InventoryReportRow,
} from '../repositories/reports.repository.interface';
import { buildAppointmentsTemplate } from '../templates/appointments/appointments.template';
import { buildBillingTemplate } from '../templates/billing/billing.template';
import { buildInventoryTemplate } from '../templates/inventory/inventory.template';

@Injectable()
export class ReportTemplateService {
  appointmentsTemplate(
    rows: AppointmentReportRow[],
    subtitle?: string,
  ): string {
    return buildAppointmentsTemplate(rows, subtitle);
  }

  billingTemplate(rows: BillingReportRow[], subtitle?: string): string {
    return buildBillingTemplate(rows, subtitle);
  }

  inventoryTemplate(rows: InventoryReportRow[]): string {
    return buildInventoryTemplate(rows);
  }
}
