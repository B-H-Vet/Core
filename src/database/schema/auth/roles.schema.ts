import {
  mysqlTable,
  int,
  varchar,
  boolean,
  mysqlEnum,
  datetime,
} from 'drizzle-orm/mysql-core';

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: mysqlEnum('name', [
    'CLIENTE',
    'RECEPCIONISTA',
    'VETERINARIO',
    'ADMINISTRADOR',
  ])
    .notNull()
    .unique(),
  description: varchar('description', { length: 255 }),
  requires_approval: boolean('requires_approval').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

export enum RolNombre {
  CLIENTE = 'CLIENTE',
  RECEPCIONISTA = 'RECEPCIONISTA',
  VETERINARIO = 'VETERINARIO',
  ADMINISTRADOR = 'ADMINISTRADOR',
}
