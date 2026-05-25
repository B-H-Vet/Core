import { Inject, Injectable } from '@nestjs/common';

import {
  IVaccinationAlertRepository,
  VACCINATION_ALERT_REPOSITORY,
  VaccinationAlertRow,
} from '../repositories/vaccinationalert.repository.interface';

@Injectable()
export class VaccinationAlertsService {
  constructor(
    @Inject(VACCINATION_ALERT_REPOSITORY)
    private readonly vaccinationAlertRepository: IVaccinationAlertRepository,
  ) {}

  /**
   * Calcula los días restantes o vencidos
   * respecto a la fecha actual.
   */
  private getDaysRemaining(date: Date): number {
    const today = new Date();
    const targetDate = new Date(date);

    const diff = targetDate.getTime() - today.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Formatea vacunas próximas a vencer.
   */
  private formatUpcoming(row: VaccinationAlertRow) {
    return {
      pet_id: row.pet_id,
      pet_name: row.pet_name,

      vaccine_id: row.vaccine_id,
      vaccine_name: row.vaccine_name,

      applied_date: row.applied_date,
      next_dose_date: row.next_dose_date,

      client_email: row.client_email,

      days_remaining: this.getDaysRemaining(row.next_dose_date),
    };
  }

  /**
   * Formatea vacunas vencidas.
   */
  private formatExpired(row: VaccinationAlertRow) {
    return {
      pet_id: row.pet_id,
      pet_name: row.pet_name,

      vaccine_id: row.vaccine_id,
      vaccine_name: row.vaccine_name,

      applied_date: row.applied_date,
      next_dose_date: row.next_dose_date,

      client_email: row.client_email,

      days_overdue: Math.abs(this.getDaysRemaining(row.next_dose_date)),
    };
  }

  /**
   * Obtiene vacunas próximas a vencer.
   */
  async findUpcoming(days = 7) {
    const rows =
      await this.vaccinationAlertRepository.findUpcomingVaccines(days);

    return rows.map((row) => this.formatUpcoming(row));
  }

  /**
   * Obtiene vacunas vencidas.
   */
  async findExpired() {
    const rows = await this.vaccinationAlertRepository.findExpiredVaccines();

    return rows.map((row) => this.formatExpired(row));
  }
}
