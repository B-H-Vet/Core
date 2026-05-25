import type { LoginUserSummaryDto } from '../login-user-summary.dto';

export class LoginAdminResponseDto {
  message!: string;
  user!: LoginUserSummaryDto;
  role!: string;
  profile!: null;
}
