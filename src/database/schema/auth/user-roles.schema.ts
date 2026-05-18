import { mysqlTable, int, datetime } from 'drizzle-orm/mysql-core';
import { users } from './users.schema';
import { roles } from './roles.schema';

export const userRoles = mysqlTable('user_roles', {
  id: int('id').primaryKey().autoincrement(),
  user_id: int('user_id').notNull().references(() => users.id),
  role_id: int('role_id').notNull().references(() => roles.id),
  assigned_at: datetime('assigned_at').notNull().default(new Date()),
  approved_at: datetime('approved_at'),
  approved_by: int('approved_by'),
  revoked_at: datetime('revoked_at'),
  revoked_by: int('revoked_by'),
});

export type UserRole = typeof userRoles.$inferSelect;
export type NewUserRole = typeof userRoles.$inferInsert;