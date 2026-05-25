import type { LoginUserSummaryDto } from '../login-user-summary.dto';

class VetProfileDto {
  id!: number;
  licenseNumber!: string;
}

export class LoginVetResponseDto {
  message!: string;
  user!: LoginUserSummaryDto;
  role!: string;
  profile!: VetProfileDto;
}
