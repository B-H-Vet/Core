import { IsEmail } from 'class-validator';

export class ResendVerificationRequestDto {
  @IsEmail({}, { message: 'The entered email does not have a valid format' })
  email!: string;
}
