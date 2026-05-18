import { mysqlTable, int, varchar, decimal, boolean, datetime, date } from 'drizzle-orm/mysql-core';
import { categories } from './categories.schema';
import { measurementUnits } from './measurement-units.schema';

export const supplies = mysqlTable('supplies', {
  id: int('id').primaryKey().autoincrement(),
  id_measurement: int('id_measurement').notNull().references(() => measurementUnits.id),
  id_category: int('id_category').notNull().references(() => categories.id),
  name: varchar('name', { length: 255 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  expiring_date: date('expiring_date'),
  min_stock: int('min_stock').notNull().default(0),
  stock: int('stock').notNull().default(0),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Supply = typeof supplies.$inferSelect;
export type NewSupply = typeof supplies.$inferInsert;