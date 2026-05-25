import { int, mysqlTable, decimal, datetime } from 'drizzle-orm/mysql-core';

import { services } from '../services/services.schema';

import { invoices } from './invoices.schema';

export const invoiceAdditionalServices = mysqlTable(
  'invoice_additional_services',
  {
    id: int('id').primaryKey().autoincrement(),

    invoice_id: int('invoice_id')
      .notNull()
      .references(() => invoices.id),

    service_id: int('service_id')
      .notNull()
      .references(() => services.id),

    unit_price: decimal('unit_price', {
      precision: 10,
      scale: 2,
    }).notNull(),

    discount_percent: decimal('discount_percent', {
      precision: 5,
      scale: 2,
    })
      .notNull()
      .default('0.00'),

    final_price: decimal('final_price', {
      precision: 10,
      scale: 2,
    }).notNull(),

    created_at: datetime('created_at').notNull().default(new Date()),
    updated_at: datetime('updated_at').notNull().default(new Date()),
    deleted_at: datetime('deleted_at'),
  },
);

export type InvoiceAdditionalService =
  typeof invoiceAdditionalServices.$inferSelect;
export type NewInvoiceAdditionalService =
  typeof invoiceAdditionalServices.$inferInsert;
