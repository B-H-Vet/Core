import { mysqlTable, int, varchar, decimal, date, datetime, mysqlEnum } from 'drizzle-orm/mysql-core';
import { clients } from '../clients/clients.schema';

export const pets = mysqlTable('pets', {
  id: int('id').primaryKey().autoincrement(),
  client_id: int('client_id').notNull().references(() => clients.id),
  name: varchar('name', { length: 100 }).notNull(),
  species: varchar('species', { length: 100 }).notNull(),
  breed: varchar('breed', { length: 100 }),
  color: varchar('color', { length: 100 }),
  birth_date: date('birth_date'),
  weight: decimal('weight', { precision: 5, scale: 2 }),
  status: mysqlEnum('status', ['ACTIVA', 'HOSPITALIZADA', 'FALLECIDA']).notNull().default('ACTIVA'),
  created_at: datetime('created_at').notNull().default(new Date()),
  updated_at: datetime('updated_at').notNull().default(new Date()),
  deleted_at: datetime('deleted_at'),
});

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;

export enum EstadoMascota {
  ACTIVA = 'ACTIVA',
  HOSPITALIZADA = 'HOSPITALIZADA',
  FALLECIDA = 'FALLECIDA',
}