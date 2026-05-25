import { mysqlTable, int, varchar, datetime } from 'drizzle-orm/mysql-core';

import { roles } from './roles.schema';
import { users } from './users.schema';

export const userRoles = mysqlTable('user_roles', {
  id: int('id').primaryKey().autoincrement(),
  user_id: varchar('user_id', { length: 36 })
    .notNull()
    .references(() => users.id),
  role_id: int('role_id')
    .notNull()
    .references(() => roles.id),
  assigned_at: datetime('assigned_at').notNull().default(new Date()),
  approved_at: datetime('approved_at'),
  approved_by: varchar('approved_by', { length: 36 }),
  revoked_at: datetime('revoked_at'),
  revoked_by: varchar('revoked_by', { length: 36 }),
});

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;
