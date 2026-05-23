export class GetAllServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  created_at!: Date;
}
export class GetServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  created_at!: Date;
}
export class CreateServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  created_at!: Date;
}
export class UpdateServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  created_at!: Date;
}
export class DeleteServiceResponseDto {
  id!: number;
  name!: string;
  description!: string | null;
  price!: string;
  is_active!: boolean;
  deleted_at!: Date;
}
