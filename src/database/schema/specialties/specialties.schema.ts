import {
  mysqlTable,
  int,
  varchar,
  boolean,
  datetime,
} from 'drizzle-orm/mysql-core';

export const specialties = mysqlTable('specialties', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Specialty = typeof specialties.$inferSelect;
export type NewSpecialty = typeof specialties.$inferInsert;
