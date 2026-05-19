import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class RegisterVetDto {
  @IsString({ message: 'El nombre ingresado debe ser texto' })
  nombreCompleto!: string;

  @IsEmail({}, { message: 'El correo ingresado no tiene un formato válido' })
  correo!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena!: string;

  @IsString({ message: 'El número de licencia debe ser texto' })
  license_number!: string;

  @IsNumber()
  @IsOptional()
  specialtyId?: number;
}
