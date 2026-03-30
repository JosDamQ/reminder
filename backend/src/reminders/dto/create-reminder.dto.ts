import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  ReminderNotificationType,
  ReminderRecurrence,
} from '../reminder.enums';

export class CreateReminderDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  remind_at: string;

  @IsOptional()
  @IsEnum(ReminderRecurrence)
  recurrence?: ReminderRecurrence;

  @IsOptional()
  @IsEnum(ReminderNotificationType)
  notification_type?: ReminderNotificationType;
}
