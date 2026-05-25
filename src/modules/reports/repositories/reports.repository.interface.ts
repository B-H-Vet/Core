export const REPORTS_REPOSITORY = 'REPORTS_REPOSITORY';

export interface AppointmentReportRow {
  appointment_id: number;
  appointment_date: Date;
  status: string;
  client_email: string;
  pet_name: string;
  vet_email: string;
}

export interface BillingReportRow {
  invoice_id: number;
  appointment_id: number;
  subtotal: string;
  total: string;
  status: string;
  created_at: Date;
}

export interface InventoryReportRow {
  supply_id: number;
  name: string;
  stock: number;
  min_stock: number;
  price: string;
  expiring_date: string | Date | null;
}

export abstract class IReportsRepository {
  abstract findAppointmentsByPeriod(data: {
    startDate: Date;
    endDate: Date;
  }): Promise<AppointmentReportRow[]>;

  abstract findBillingByPeriod(data: {
    startDate: Date;
    endDate: Date;
  }): Promise<BillingReportRow[]>;

  abstract findCurrentInventory(): Promise<InventoryReportRow[]>;
}
