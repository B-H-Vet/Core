import { int, mysqlTable, decimal, datetime } from 'drizzle-orm/mysql-core';

import { services } from '../services/services.schema';

import { appointments } from './appointments.schema';

export const appointmentServices = mysqlTable('appointment_services', {
  id: int('id').primaryKey().autoincrement(),

  appointment_id: int('appointment_id')
    .notNull()
    .references(() => appointments.id),

  service_id: int('service_id')
    .notNull()
    .references(() => services.id),

  unit_price: decimal('unit_price', {
    precision: 10,
    scale: 2,
  }).notNull(),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type AppointmentService = typeof appointmentServices.$inferSelect;
export type NewAppointmentService = typeof appointmentServices.$inferInsert;
