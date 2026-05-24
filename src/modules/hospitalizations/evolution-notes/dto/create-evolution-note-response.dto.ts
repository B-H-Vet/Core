export class CreateEvolutionNoteResponseDto {
  id!: number;
  hospitalization_id!: number;
  vet_id!: number;
  note!: string;
  created_at!: Date;
  updated_at!: Date;
}
