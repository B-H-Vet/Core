import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEvolutionNoteDto {
  @IsString()
  @IsNotEmpty()
  note!: string;
}
