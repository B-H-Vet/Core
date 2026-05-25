import { int, mysqlTable, decimal, datetime } from 'drizzle-orm/mysql-core';

import { supplies } from '../inventory/supplies.schema';

import { invoices } from './invoices.schema';

export const invoiceInventoryItems = mysqlTable('invoice_inventory_items', {
  id: int('id').primaryKey().autoincrement(),

  invoice_id: int('invoice_id')
    .notNull()
    .references(() => invoices.id),

  supply_id: int('supply_id')
    .notNull()
    .references(() => supplies.id),

  quantity: int('quantity').notNull(),

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
});

export type InvoiceInventoryItem = typeof invoiceInventoryItems.$inferSelect;
export type NewInvoiceInventoryItem = typeof invoiceInventoryItems.$inferInsert;
