import type { EvolutionNote } from '../../../../database/schema/hospitalizations/evolution-notes.schema';

export const EVOLUTION_NOTE_REPOSITORY = 'EVOLUTION_NOTE_REPOSITORY';

export abstract class IEvolutionNoteRepository {
  abstract create(data: {
    hospitalization_id: number;
    vet_id: number;
    note: string;
  }): Promise<EvolutionNote>;

  abstract findByHospitalizationId(
    hospitalizationId: number,
  ): Promise<EvolutionNote[]>;

  abstract softDeleteByHospitalizationId(
    hospitalizationId: number,
  ): Promise<void>;
}
