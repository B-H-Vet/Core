export class DeleteServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  deleted_at!: Date;
}
