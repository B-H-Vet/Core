import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { ReportPeriodDto } from '../dto/report-period.dto';
import {
  IReportsRepository,
  REPORTS_REPOSITORY,
} from '../repositories/reports.repository.interface';

import { PdfService } from './pdf.service';

@Injectable()
export class ReportsService {
  constructor(
    @Inject(REPORTS_REPOSITORY)
    private readonly reportsRepository: IReportsRepository,

    private readonly pdfService: PdfService,
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

    return this.pdfService.generateReport({
      title: 'Reporte de citas por periodo',
      subtitle: period.label,
      columns: ['ID', 'Fecha', 'Estado', 'Cliente', 'Mascota', 'Veterinario'],
      rows: rows.map((row) => [
        row.appointment_id,
        row.appointment_date.toISOString(),
        row.status,
        row.client_email,
        row.pet_name,
        row.vet_email,
      ]),
    });
  }

  async billingByPeriod(dto: ReportPeriodDto): Promise<Buffer> {
    const period = this.parsePeriod(dto);

    const rows = await this.reportsRepository.findBillingByPeriod(period);

    const total = rows.reduce((acc, row) => acc + Number(row.total), 0);

    return this.pdfService.generateReport({
      title: 'Reporte de facturación por periodo',
      subtitle: `${period.label} | Total facturado: ${String(total)}`,
      columns: ['Factura', 'Cita', 'Subtotal', 'Total', 'Estado', 'Fecha'],
      rows: rows.map((row) => [
        row.invoice_id,
        row.appointment_id,
        row.subtotal,
        row.total,
        row.status,
        row.created_at.toISOString(),
      ]),
    });
  }

  async currentInventory(): Promise<Buffer> {
    const rows = await this.reportsRepository.findCurrentInventory();

    return this.pdfService.generateReport({
      title: 'Reporte de inventario actual',
      subtitle:
        'Productos con stock disponible, precio, vencimiento y alerta de stock bajo',
      columns: [
        'ID',
        'Producto',
        'Stock',
        'Mínimo',
        'Precio',
        'Vence',
        'Alerta',
      ],
      rows: rows.map((row) => [
        row.supply_id,
        row.name,
        row.stock,
        row.min_stock,
        row.price,
        row.expiring_date ? new Date(row.expiring_date).toISOString() : '',
        row.stock <= row.min_stock ? 'Stock bajo' : '',
      ]),
    });
  }
}
