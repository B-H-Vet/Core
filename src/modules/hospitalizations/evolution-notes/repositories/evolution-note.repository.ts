import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import {
  DATABASE_CONNECTION,
  type Database,
} from '../../../../database/database.module';
import {
  evolutionNotes,
  type EvolutionNote,
} from '../../../../database/schema/hospitalizations/evolution-notes.schema';

import { IEvolutionNoteRepository } from './evolution-note.repository.interface';

@Injectable()
export class EvolutionNoteRepository implements IEvolutionNoteRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async create(data: {
    hospitalization_id: number;
    vet_id: number;
    note: string;
  }): Promise<EvolutionNote> {
    await this.db.insert(evolutionNotes).values({
      hospitalization_id: data.hospitalization_id,
      vet_id: data.vet_id,
      note: data.note,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const result = await this.db
      .select()
      .from(evolutionNotes)
      .where(
        and(
          eq(evolutionNotes.hospitalization_id, data.hospitalization_id),
          eq(evolutionNotes.note, data.note),
          eq(evolutionNotes.vet_id, data.vet_id),
          isNull(evolutionNotes.deleted_at),
        ),
      )
      .limit(1);

    if (!result[0]) {
      throw new Error('Error al crear la nota de evolución');
    }

    return result[0];
  }

  async findByHospitalizationId(
    hospitalizationId: number,
  ): Promise<EvolutionNote[]> {
    return this.db
      .select()
      .from(evolutionNotes)
      .where(
        and(
          eq(evolutionNotes.hospitalization_id, hospitalizationId),
          isNull(evolutionNotes.deleted_at),
        ),
      );
  }

  async softDeleteByHospitalizationId(
    hospitalizationId: number,
  ): Promise<void> {
    await this.db
      .update(evolutionNotes)
      .set({
        deleted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(evolutionNotes.hospitalization_id, hospitalizationId));
  }
}
