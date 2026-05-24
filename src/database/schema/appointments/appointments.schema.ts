import {
  int,
  mysqlEnum,
  mysqlTable,
  datetime,
  varchar,
} from 'drizzle-orm/mysql-core';

import { users } from '../auth/users.schema';
import { pets } from '../pets/pets.schema';
import { vets } from '../vets/vets.schema';
import { payments } from '../payments/payments.schema';

export const appointmentStatusEnum = mysqlEnum('status', [
  'PAGADA',
  'ATENDIDA',
  'CANCELADA',
]);

export const appointments = mysqlTable('appointments', {
  id: int('id').primaryKey().autoincrement(),

  user_id: int('user_id')
    .notNull()
    .references(() => users.id),

  vet_id: int('vet_id')
    .notNull()
    .references(() => vets.id),

  pet_id: int('pet_id')
    .notNull()
    .references(() => pets.id),

  payment_id: int('payment_id')
    .notNull()
    .references(() => payments.id),

  date: datetime('date').notNull(),

  end_date: datetime('end_date').notNull(),

  status: appointmentStatusEnum.notNull().default('PAGADA'),

  invoice_number: varchar('invoice_number', { length: 100 }),

  paid_at: datetime('paid_at'),

  rescheduled_at: datetime('rescheduled_at'),

  canceled_at: datetime('canceled_at'),

  cancel_reason: varchar('cancel_reason', { length: 500 }),

  created_at: datetime('created_at')
    .notNull()
    .default(new Date()),

  updated_at: datetime('updated_at')
    .notNull()
    .default(new Date()),

  deleted_at: datetime('deleted_at'),
});

export type Appointment = typeof appointments.$inferSelect;

export type NewAppointment = typeof appointments.$inferInsert;

export type AppointmentStatus = Appointment['status'];