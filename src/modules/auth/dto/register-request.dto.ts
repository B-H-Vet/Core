import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

import { ROL_NOMBRES } from '../../../database/schema/auth/roles.schema';
import type { RolNombre } from '../../../database/schema/auth/roles.schema';

export class RegisterRequestDto {
  @IsString({ message: 'The entered name must be text' })
  fullName!: string;

  @IsEmail({}, { message: 'The entered email does not have a valid format' })
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'The entered password must be at least 8 characters long',
  })
  password!: string;

  @IsIn(Object.values(ROL_NOMBRES), {
    message: 'The entered role is not valid',
  })
  role!: RolNombre;
}
