import { IsString, Length } from 'class-validator';

export class VerifyCodeRequestDto {
  @IsString()
  @Length(6, 6, {
    message: 'The entered code must be exactly 6 digits',
  })
  code!: string;
}
