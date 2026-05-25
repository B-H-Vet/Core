import { int, mysqlTable, decimal, datetime } from 'drizzle-orm/mysql-core';

import { supplies } from '../inventory/supplies.schema';
import { medicineDetails } from '../medical-records/medicine-details.schema';

import { invoices } from './invoices.schema';

export const invoiceMedicineDetails = mysqlTable('invoice_medicine_details', {
  id: int('id').primaryKey().autoincrement(),

  invoice_id: int('invoice_id')
    .notNull()
    .references(() => invoices.id),

  medicine_detail_id: int('medicine_detail_id')
    .notNull()
    .references(() => medicineDetails.id),

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

export type InvoiceMedicineDetail = typeof invoiceMedicineDetails.$inferSelect;
export type NewInvoiceMedicineDetail =
  typeof invoiceMedicineDetails.$inferInsert;
