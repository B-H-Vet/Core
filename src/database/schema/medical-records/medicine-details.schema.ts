import {
  datetime,
  int,
  mysqlTable,
  text,
} from 'drizzle-orm/mysql-core';

import { medicalRecords } from './medical-records.schema';
import { supplies } from '../inventory/supplies.schema';

export const medicineDetails = mysqlTable('medicine_details', {
  id: int('id').primaryKey().autoincrement(),

  medical_record_id: int('medical_record_id')
    .notNull()
    .references(() => medicalRecords.id),

  supply_id: int('supply_id')
    .notNull()
    .references(() => supplies.id),

  dose: text('dose').notNull(),
  duration: text('duration').notNull(),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

export type MedicineDetail = typeof medicineDetails.$inferSelect;
export type NewMedicineDetail = typeof medicineDetails.$inferInsert;