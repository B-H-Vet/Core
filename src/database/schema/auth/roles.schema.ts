import {
  mysqlTable,
  int,
  varchar,
  boolean,
  mysqlEnum,
  datetime,
} from 'drizzle-orm/mysql-core';

export const ROL_NOMBRES = {
  CLIENTE: 'CLIENTE',
  RECEPCIONISTA: 'RECEPCIONISTA',
  VETERINARIO: 'VETERINARIO',
  ADMINISTRADOR: 'ADMINISTRADOR',
} as const;
export type RolNombre = (typeof ROL_NOMBRES)[keyof typeof ROL_NOMBRES];

export const roles = mysqlTable('roles', {
  id: int('id').primaryKey().autoincrement(),
  name: mysqlEnum('name', [
    ROL_NOMBRES.CLIENTE,
    ROL_NOMBRES.RECEPCIONISTA,
    ROL_NOMBRES.VETERINARIO,
    ROL_NOMBRES.ADMINISTRADOR,
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
