import { IsEnum, IsNotEmpty } from 'class-validator';

export enum DischargeStatusDto {
  RECOVERED = 'RECOVERED',
  DECEASED = 'DECEASED',
  TRANSFERRED = 'TRANSFERRED',
}

export class DischargeHospitalizationDto {
  @IsEnum(DischargeStatusDto)
  @IsNotEmpty()
  egress_status!: DischargeStatusDto;
}
