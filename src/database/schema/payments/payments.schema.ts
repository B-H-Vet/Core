import {
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';

import { users } from '../auth/users.schema';

export const paymentStatusEnum = mysqlEnum('status', [
  'APPROVED',
  'REJECTED',
  'PENDING',
]);

export const paymentMethodEnum = mysqlEnum('method', [
  'CASH',
  'CARD',
  'TRANSFER',
  'PSE',
]);

export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),

  user_id: int('user_id')
    .notNull()
    .references(() => users.id),

  amount: decimal('amount', {
    precision: 10,
    scale: 2,
  }).notNull(),

  method: paymentMethodEnum.notNull(),

  status: paymentStatusEnum.notNull().default('PENDING'),

  transaction_reference: varchar('transaction_reference', {
    length: 150,
  }),

  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentStatus = Payment['status'];
export type PaymentMethod = Payment['method'];