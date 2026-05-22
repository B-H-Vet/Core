import type { UserSummaryResponseDto } from './user-summary-response.dto';

export class FindClientByIdResponseDto {
  id!: number;
  phone!: string;
  address!: string | null;
  is_active!: boolean;
  created_at!: Date;
  user!: UserSummaryResponseDto;
}
