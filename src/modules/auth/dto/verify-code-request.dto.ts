import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyCodeRequestDto {
  @IsEmail({}, { message: 'El correo ingresado no tiene un formato válido' })
  correo!: string;

  @IsString()
  @Length(6, 6, {
    message: 'El código ingresado debe tener exactamente 6 dígitos',
  })
  codigo!: string;
}
