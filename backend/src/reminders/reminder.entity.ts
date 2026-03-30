import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import {
  ReminderNotificationType,
  ReminderRecurrence,
  ReminderStatus,
} from './reminder.enums';

@Entity({ name: 'reminders' })
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamp' })
  remind_at: Date;

  @Column({
    type: 'enum',
    enum: ReminderRecurrence,
    default: ReminderRecurrence.NONE,
  })
  recurrence: ReminderRecurrence;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status: ReminderStatus;

  @Column({ type: 'varchar', length: 20 })
  phone_number: string;

  @Column({
    type: 'enum',
    enum: ReminderNotificationType,
    default: ReminderNotificationType.WHATSAPP,
  })
  notification_type: ReminderNotificationType;

  @Column({ type: 'varchar', nullable: true })
  job_id: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.reminders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
