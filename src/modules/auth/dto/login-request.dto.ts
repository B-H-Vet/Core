import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsEmail({}, { message: 'El correo ingresado no tiene un formato válido' })
  correo!: string;

  @IsString()
  @MinLength(8, {
    message: 'La contraseña ingresada debe tener al menos 8 caracteres',
  })
  contrasena!: string;
}
