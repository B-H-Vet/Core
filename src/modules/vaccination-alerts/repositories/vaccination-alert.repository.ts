import { Inject, Injectable } from '@nestjs/common';
import { and, eq, gte, isNotNull, lte, lt } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../database/database.module';
import { appointments } from '../../../database/schema/appointments/appointments.schema';
import { users } from '../../../database/schema/auth/users.schema';
import { clients } from '../../../database/schema/clients/clients.schema';
import { supplies } from '../../../database/schema/inventory/supplies.schema';
import { medicalRecords } from '../../../database/schema/medical-records/medical-records.schema';
import { vaccineDetails } from '../../../database/schema/medical-records/vaccine-details.schema';
import { pets } from '../../../database/schema/pets/pets.schema';

import {
  IVaccinationAlertRepository,
  VaccinationAlertRow,
} from './vaccinationalert.repository.interface';

@Injectable()
export class VaccinationAlertRepository extends IVaccinationAlertRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {
    super();
  }

  async findUpcomingVaccines(days: number): Promise<VaccinationAlertRow[]> {
    const today = new Date();

    const limitDate = new Date();
    limitDate.setDate(today.getDate() + days);

    return this.db
      .select({
        pet_id: pets.id,
        pet_name: pets.name,

        vaccine_id: supplies.id,
        vaccine_name: supplies.name,

        applied_date: vaccineDetails.applied_date,
        next_dose_date: vaccineDetails.next_dose_date,

        client_email: users.email,
      })
      .from(vaccineDetails)

      .innerJoin(
        medicalRecords,
        eq(vaccineDetails.medical_record_id, medicalRecords.id),
      )

      .innerJoin(
        appointments,
        eq(medicalRecords.appointment_id, appointments.id),
      )

      .innerJoin(pets, eq(appointments.pet_id, pets.id))

      .innerJoin(clients, eq(pets.client_id, clients.id))

      .innerJoin(users, eq(clients.user_id, users.id))

      .innerJoin(supplies, eq(vaccineDetails.supply_id, supplies.id))

      .where(
        and(
          isNotNull(vaccineDetails.next_dose_date),

          gte(vaccineDetails.next_dose_date, today),

          lte(vaccineDetails.next_dose_date, limitDate),
        ),
      ) as Promise<VaccinationAlertRow[]>;
  }

  /**
   * Obtiene vacunas vencidas.
   */
  async findExpiredVaccines(): Promise<VaccinationAlertRow[]> {
    const today = new Date();

    return this.db
      .select({
        pet_id: pets.id,
        pet_name: pets.name,

        vaccine_id: supplies.id,
        vaccine_name: supplies.name,

        applied_date: vaccineDetails.applied_date,
        next_dose_date: vaccineDetails.next_dose_date,

        client_email: users.email,
      })
      .from(vaccineDetails)

      .innerJoin(
        medicalRecords,
        eq(vaccineDetails.medical_record_id, medicalRecords.id),
      )

      .innerJoin(
        appointments,
        eq(medicalRecords.appointment_id, appointments.id),
      )

      .innerJoin(pets, eq(appointments.pet_id, pets.id))

      .innerJoin(clients, eq(pets.client_id, clients.id))

      .innerJoin(users, eq(clients.user_id, users.id))

      .innerJoin(supplies, eq(vaccineDetails.supply_id, supplies.id))

      .where(
        and(
          isNotNull(vaccineDetails.next_dose_date),

          lt(vaccineDetails.next_dose_date, today),
        ),
      ) as Promise<VaccinationAlertRow[]>;
  }
}
