import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';

import { RolNombre } from '../../../database/schema/auth/roles.schema';

export class RegisterRequestDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El correo ingresado no tiene un formato válido' })
  correo!: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña ingresada debe tener al menos 8 caracteres',
  })
  contrasena!: string;

  @IsEnum(RolNombre, { message: 'El rol ingresado no es válido' })
  rol!: RolNombre;
}
