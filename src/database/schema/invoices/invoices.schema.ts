import {
  int,
  mysqlEnum,
  mysqlTable,
  datetime,
  varchar,
  decimal,
} from 'drizzle-orm/mysql-core';

import { appointments } from '../appointments/appointments.schema';
import { users } from '../auth/users.schema';

export const invoiceStatusEnum = mysqlEnum('status', [
  'PENDIENTE',
  'PAGADA',
  'ANULADA',
]);

export const invoices = mysqlTable('invoices', {
  id: int('id').primaryKey().autoincrement(),

  appointment_id: int('appointment_id')
    .notNull()
    .references(() => appointments.id)
    .unique(),

  invoice_number: varchar('invoice_number', { length: 100 }).notNull(),

  status: invoiceStatusEnum.notNull().default('PENDIENTE'),

  paid_amount: decimal('paid_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),

  subtotal_unpaid: decimal('subtotal_unpaid', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),

  discount_total: decimal('discount_total', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),

  total_amount: decimal('total_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),

  remaining_amount: decimal('remaining_amount', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),

  payment_link_token: varchar('payment_link_token', { length: 255 }),
  payment_link_expires_at: datetime('payment_link_expires_at'),

  paid_at: datetime('paid_at'),

  cancellation_reason: varchar('cancellation_reason', { length: 500 }),

  cancelled_by_user_id: int('cancelled_by_user_id').references(() => users.id),
  cancelled_at: datetime('cancelled_at'),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceStatus = Invoice['status'];
