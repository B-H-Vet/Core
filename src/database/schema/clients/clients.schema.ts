import {
  mysqlTable,
  int,
  varchar,
  boolean,
  datetime,
} from 'drizzle-orm/mysql-core';

import { users } from '../auth/users.schema';

export const clients = mysqlTable('clients', {
  id: int('id').primaryKey().autoincrement(),
  user_id: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: varchar('address', { length: 255 }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
