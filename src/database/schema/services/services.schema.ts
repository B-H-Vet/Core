import {
  mysqlTable,
  int,
  varchar,
  decimal,
  boolean,
  datetime,
} from 'drizzle-orm/mysql-core';

export const services = mysqlTable('services', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 500 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration_minutes: int('duration_minutes').notNull().default(30),
  is_active: boolean('is_active').notNull().default(true),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
