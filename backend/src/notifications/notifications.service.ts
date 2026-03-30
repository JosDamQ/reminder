import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReminderNotificationType } from '../reminders/reminder.enums';
import { Reminder } from '../reminders/reminder.entity';
import { User } from '../users/user.entity';
import { NotificationLog } from './notification-log.entity';
import { NotificationLogStatus, NotificationProvider } from './notification.enums';

type NotificationAttemptResult = {
  success: boolean;
  errorMessage: string | null;
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogsRepository: Repository<NotificationLog>,
  ) {}

  async sendReminderNotification(reminder: Reminder): Promise<NotificationAttemptResult> {
    const owner = reminder.user;

    if (!owner?.callmebot_api_key) {
      await this.createNotificationLog(
        reminder,
        NotificationProvider.CALLMEBOT,
        NotificationLogStatus.FAILED,
        'API key not configured',
      );

      return {
        success: false,
        errorMessage: 'API key not configured',
      };
    }

    if (reminder.notification_type === ReminderNotificationType.SMS) {
      await this.createNotificationLog(
        reminder,
        NotificationProvider.TWILIO,
        NotificationLogStatus.FAILED,
        'SMS provider not configured',
      );

      return {
        success: false,
        errorMessage: 'SMS provider not configured',
      };
    }

    try {
      await this.sendCallMeBotMessage(
        owner.phone_number,
        owner.callmebot_api_key,
        this.buildReminderMessage(reminder),
      );

      await this.createNotificationLog(
        reminder,
        NotificationProvider.CALLMEBOT,
        NotificationLogStatus.SUCCESS,
        null,
      );

      return {
        success: true,
        errorMessage: null,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unexpected notification error';

      await this.createNotificationLog(
        reminder,
        NotificationProvider.CALLMEBOT,
        NotificationLogStatus.FAILED,
        errorMessage,
      );

      return {
        success: false,
        errorMessage,
      };
    }
  }

  async sendTestNotification(user: User): Promise<NotificationAttemptResult> {
    if (!user.callmebot_api_key) {
      return {
        success: false,
        errorMessage: 'API key not configured',
      };
    }

    try {
      await this.sendCallMeBotMessage(
        user.phone_number,
        user.callmebot_api_key,
        'RemindMe test notification',
      );

      return {
        success: true,
        errorMessage: null,
      };
    } catch (error) {
      return {
        success: false,
        errorMessage:
          error instanceof Error ? error.message : 'Unexpected notification error',
      };
    }
  }

  private async createNotificationLog(
    reminder: Reminder,
    provider: NotificationProvider,
    status: NotificationLogStatus,
    errorMessage: string | null,
  ): Promise<NotificationLog> {
    const log = this.notificationLogsRepository.create({
      reminder_id: reminder.id,
      sent_at: new Date(),
      provider,
      status,
      error_message: errorMessage,
      reminder,
    });

    return this.notificationLogsRepository.save(log);
  }

  private async sendCallMeBotMessage(
    phoneNumber: string,
    apiKey: string,
    text: string,
  ): Promise<void> {
    const url = new URL('https://api.callmebot.com/whatsapp.php');
    url.searchParams.set('phone', phoneNumber);
    url.searchParams.set('text', text);
    url.searchParams.set('apikey', apiKey);

    const response = await fetch(url.toString(), { method: 'GET' });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'CallMeBot request failed');
    }
  }

  private buildReminderMessage(reminder: Reminder): string {
    const lines = [`Reminder: ${reminder.title}`];

    if (reminder.description) {
      lines.push(`Description: ${reminder.description}`);
    }

    lines.push(`Scheduled for: ${reminder.remind_at.toISOString()}`);

    return lines.join('\n');
  }
}

