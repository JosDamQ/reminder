import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import {
  ReminderNotificationType,
  ReminderRecurrence,
  ReminderStatus,
} from './reminder.enums';
import { Reminder } from './reminder.entity';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly remindersRepository: Repository<Reminder>,
  ) {}

  async create(user: User, createReminderDto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.remindersRepository.create({
      user_id: user.id,
      title: createReminderDto.title,
      description: createReminderDto.description ?? null,
      remind_at: new Date(createReminderDto.remind_at),
      recurrence: createReminderDto.recurrence ?? ReminderRecurrence.NONE,
      status: ReminderStatus.PENDING,
      phone_number: user.phone_number,
      notification_type:
        createReminderDto.notification_type ?? ReminderNotificationType.WHATSAPP,
      job_id: null,
      user,
    });

    return this.remindersRepository.save(reminder);
  }

  async findAll(userId: string): Promise<Reminder[]> {
    return this.remindersRepository.find({
      where: { user_id: userId },
      order: {
        remind_at: 'ASC',
        created_at: 'DESC',
      },
    });
  }

  async findOne(userId: string, id: string): Promise<Reminder> {
    const reminder = await this.remindersRepository.findOne({
      where: { id, user_id: userId },
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder ${id} not found`);
    }

    return reminder;
  }

  async update(
    userId: string,
    id: string,
    updateReminderDto: UpdateReminderDto,
  ): Promise<Reminder> {
    const reminder = await this.findOne(userId, id);

    if (updateReminderDto.title !== undefined) {
      reminder.title = updateReminderDto.title;
    }

    if (updateReminderDto.description !== undefined) {
      reminder.description = updateReminderDto.description ?? null;
    }

    if (updateReminderDto.remind_at !== undefined) {
      reminder.remind_at = new Date(updateReminderDto.remind_at);
    }

    if (updateReminderDto.recurrence !== undefined) {
      reminder.recurrence = updateReminderDto.recurrence;
    }

    if (updateReminderDto.status !== undefined) {
      reminder.status = updateReminderDto.status;
    }

    if (updateReminderDto.notification_type !== undefined) {
      reminder.notification_type = updateReminderDto.notification_type;
    }

    return this.remindersRepository.save(reminder);
  }

  async remove(userId: string, id: string): Promise<void> {
    const reminder = await this.findOne(userId, id);
    await this.remindersRepository.remove(reminder);
  }
}
