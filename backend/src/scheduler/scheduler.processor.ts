import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Repository } from 'typeorm';

import { NotificationsService } from '../notifications/notifications.service';
import { ReminderRecurrence, ReminderStatus } from '../reminders/reminder.enums';
import { Reminder } from '../reminders/reminder.entity';
import { REMINDERS_QUEUE, SEND_REMINDER_JOB } from './scheduler.constants';
import { SchedulerService } from './scheduler.service';
import { getNextRemindAt } from './scheduler.utils';

type ReminderJobPayload = {
  reminderId: string;
};

@Injectable()
@Processor(REMINDERS_QUEUE)
export class SchedulerProcessor {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
    private readonly notificationsService: NotificationsService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Process(SEND_REMINDER_JOB)
  async handleReminder(job: Job<ReminderJobPayload>): Promise<void> {
    const reminder = await this.remindersRepository.findOne({
      where: { id: job.data.reminderId },
      relations: {
        user: true,
      },
    });

    if (!reminder || reminder.status === ReminderStatus.CANCELLED) {
      return;
    }

    const result = await this.notificationsService.sendReminderNotification(reminder);

    if (reminder.recurrence === ReminderRecurrence.NONE) {
      reminder.job_id = null;
      reminder.status = result.success ? ReminderStatus.SENT : ReminderStatus.PENDING;
      await this.remindersRepository.save(reminder);
      return;
    }

    const nextRemindAt = getNextRemindAt(reminder.remind_at, reminder.recurrence);
    if (!nextRemindAt) {
      reminder.job_id = null;
      await this.remindersRepository.save(reminder);
      return;
    }

    reminder.remind_at = nextRemindAt;
    reminder.status = ReminderStatus.PENDING;
    await this.schedulerService.syncReminder(reminder);
  }
}

