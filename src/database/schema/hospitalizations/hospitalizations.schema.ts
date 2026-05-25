import { datetime, int, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core';

import { pets } from '../pets/pets.schema';
import { vets } from '../vets/vets.schema';

export const egressStatusEnum = mysqlEnum('egress_status', [
  'RECOVERED',
  'DECEASED',
  'TRANSFERRED',
]);

export const hospitalizations = mysqlTable('hospitalizations', {
  id: int('id').primaryKey().autoincrement(),

  pet_id: int('pet_id')
    .notNull()
    .references(() => pets.id),

  vet_id: int('vet_id')
    .notNull()
    .references(() => vets.id),

  admission_date: datetime('admission_date').notNull(),

  egress_date: datetime('egress_date'),

  egress_status: egressStatusEnum,

  created_at: datetime('created_at')
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: datetime('updated_at')
    .notNull()
    .$defaultFn(() => new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Hospitalization = typeof hospitalizations.$inferSelect;
export type NewHospitalization = typeof hospitalizations.$inferInsert;
export type EgressStatus = Hospitalization['egress_status'];
