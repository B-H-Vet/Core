import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterClientDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El correo ingresado no tiene un formato válido' })
  correo!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena!: string;
}
