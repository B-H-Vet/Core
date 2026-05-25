import {
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterVetDto {
  @IsString({ message: 'The entered name must be text' })
  fullName!: string;

  @IsEmail({}, { message: 'The entered email does not have a valid format' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'The password must be at least 8 characters long' })
  password!: string;

  @IsString({ message: 'The license number must be text' })
  licenseNumber!: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  specialtyIds?: number[];
}
