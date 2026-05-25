import type { LoginUserSummaryDto } from '../login-user-summary.dto';

class ClientProfileDto {
  id!: number;
  phone!: string;
  address!: string | null;
}

export class LoginClientResponseDto {
  message!: string;
  user!: LoginUserSummaryDto;
  role!: string;
  profile!: ClientProfileDto;
}
