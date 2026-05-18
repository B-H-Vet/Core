import { mysqlTable, int, varchar, datetime, boolean } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  email_verified_at: datetime('email_verified_at'),
  approved_at: datetime('approved_at'),
  verification_code: varchar('verification_code', { length: 6 }),
  verification_code_expires_at: datetime('verification_code_expires_at'),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;