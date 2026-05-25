import {
  mysqlTable,
  int,
  varchar,
  boolean,
  datetime,
} from 'drizzle-orm/mysql-core';

import { users } from '../auth/users.schema';

export const vets = mysqlTable('vets', {
  id: int('id').primaryKey().autoincrement(),
  user_id: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  license_number: varchar('license_number', { length: 100 }).notNull().unique(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Vet = typeof vets.$inferSelect;
export type NewVet = typeof vets.$inferInsert;
