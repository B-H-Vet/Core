import {
  datetime,
  int,
  mysqlTable,
  text,
  decimal,
} from 'drizzle-orm/mysql-core';

import { appointments } from '../appointments/appointments.schema';

export const medicalRecords = mysqlTable('medical_records', {
  id: int('id').primaryKey().autoincrement(),

  appointment_id: int('appointment_id')
    .notNull()
    .references(() => appointments.id),

  visit_reason: text('visit_reason').notNull(),
  diagnosis: text('diagnosis').notNull(),
  treatment: text('treatment').notNull(),

  weight_at_visit: decimal('weight_at_visit', {
    precision: 10,
    scale: 2,
  }).notNull(),

  next_visit_date: datetime('next_visit_date'),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;