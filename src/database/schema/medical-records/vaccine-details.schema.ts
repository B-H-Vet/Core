import { datetime, int, mysqlTable } from 'drizzle-orm/mysql-core';

import { supplies } from '../inventory/supplies.schema';

import { medicalRecords } from './medical-records.schema';

export const vaccineDetails = mysqlTable('vaccine_details', {
  id: int('id').primaryKey().autoincrement(),

  medical_record_id: int('medical_record_id')
    .notNull()
    .references(() => medicalRecords.id),

  supply_id: int('supply_id')
    .notNull()
    .references(() => supplies.id),

  applied_date: datetime('applied_date').notNull(),
  next_dose_date: datetime('next_dose_date'),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

export type VaccineDetail = typeof vaccineDetails.$inferSelect;
export type NewVaccineDetail = typeof vaccineDetails.$inferInsert;
