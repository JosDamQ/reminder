import { IsPhoneNumber, Matches } from 'class-validator';

export class VerifyPinDto {
  @IsPhoneNumber()
  phone_number: string;

  @Matches(/^\d{6}$/)
  pin: string;
}
