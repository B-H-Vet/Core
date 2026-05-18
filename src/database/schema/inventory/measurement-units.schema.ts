import { mysqlTable, int, varchar, datetime } from 'drizzle-orm/mysql-core';

export const measurementUnits = mysqlTable('measurement_units', {
  id: int('id').primaryKey().autoincrement(),
  unit: varchar('unit', { length: 100 }).notNull().unique(),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type MeasurementUnit = typeof measurementUnits.$inferSelect;
export type NewMeasurementUnit = typeof measurementUnits.$inferInsert;