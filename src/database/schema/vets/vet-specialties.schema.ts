import { mysqlTable, int, primaryKey } from 'drizzle-orm/mysql-core';
import { vets } from './vets.schema';
import { specialties } from '../specialties/specialties.schema';

export const vetSpecialties = mysqlTable(
  'vet_specialties',
  {
    vet_id: int('vet_id')
      .notNull()
      .references(() => vets.id),

    specialty_id: int('specialty_id')
      .notNull()
      .references(() => specialties.id),
  },
  (table) => [
    primaryKey({
      columns: [table.vet_id, table.specialty_id],
    }),
  ],
);