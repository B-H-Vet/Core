import { datetime, int, mysqlTable, text } from 'drizzle-orm/mysql-core';

import { vets } from '../vets/vets.schema';

import { hospitalizations } from './hospitalizations.schema';

export const evolutionNotes = mysqlTable('evolution_notes', {
  id: int('id').primaryKey().autoincrement(),

  hospitalization_id: int('hospitalization_id')
    .notNull()
    .references(() => hospitalizations.id),

  vet_id: int('vet_id')
    .notNull()
    .references(() => vets.id),

  note: text('note').notNull(),

  created_at: datetime('created_at')
    .notNull()
    .$defaultFn(() => new Date()),
  updated_at: datetime('updated_at')
    .notNull()
    .$defaultFn(() => new Date()),
  deleted_at: datetime('deleted_at'),
});

export type EvolutionNote = typeof evolutionNotes.$inferSelect;
export type NewEvolutionNote = typeof evolutionNotes.$inferInsert;
