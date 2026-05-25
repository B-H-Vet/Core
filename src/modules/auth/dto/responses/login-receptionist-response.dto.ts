import type { LoginUserSummaryDto } from '../login-user-summary.dto';

export class LoginReceptionistResponseDto {
  message!: string;
  user!: LoginUserSummaryDto;
  role!: string;
  profile!: null;
}
