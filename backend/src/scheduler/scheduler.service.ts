import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Repository } from 'typeorm';

import { ReminderStatus } from '../reminders/reminder.enums';
import { Reminder } from '../reminders/reminder.entity';
import { REMINDERS_QUEUE, SEND_REMINDER_JOB } from './scheduler.constants';

type ReminderJobPayload = {
  reminderId: string;
};

@Injectable()
export class SchedulerService {
  constructor(
    @InjectQueue(REMINDERS_QUEUE)
    private readonly remindersQueue: Queue<ReminderJobPayload>,
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
  ) {}

  async syncReminder(reminder: Reminder): Promise<Reminder> {
    await this.removeReminderJob(reminder.job_id);

    reminder.job_id = null;

    if (reminder.status !== ReminderStatus.PENDING) {
      return this.remindersRepository.save(reminder);
    }

    const job = await this.remindersQueue.add(
      SEND_REMINDER_JOB,
      { reminderId: reminder.id },
      {
        delay: this.getDelay(reminder.remind_at),
        removeOnComplete: true,
        removeOnFail: true,
      },
    );

    reminder.job_id = String(job.id);

    return this.remindersRepository.save(reminder);
  }

  async clearReminder(reminder: Reminder): Promise<Reminder> {
    await this.removeReminderJob(reminder.job_id);
    reminder.job_id = null;
    return this.remindersRepository.save(reminder);
  }

  async removeReminderJob(jobId: string | null): Promise<void> {
    if (!jobId) {
      return;
    }

    const job = await this.remindersQueue.getJob(jobId);
    if (!job) {
      return;
    }

    await job.remove();
  }

  private getDelay(remindAt: Date): number {
    return Math.max(remindAt.getTime() - Date.now(), 0);
  }
}
