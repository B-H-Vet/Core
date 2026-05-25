import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterAdminRequestDto {
  @IsString({ message: 'The entered name must be text' })
  fullName!: string;

  @IsEmail({}, { message: 'The entered email does not have a valid format' })
  email!: string;

  @IsString()
  @MinLength(8, {
    message: 'The entered password must be at least 8 characters long',
  })
  password!: string;
}
