import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Reminder } from '../reminders/reminder.entity';
import { NotificationLogStatus, NotificationProvider } from './notification.enums';

@Entity({ name: 'notification_logs' })
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  reminder_id: string;

  @Column({ type: 'timestamp' })
  sent_at: Date;

  @Column({ type: 'varchar', length: 30 })
  provider: NotificationProvider;

  @Column({
    type: 'enum',
    enum: NotificationLogStatus,
  })
  status: NotificationLogStatus;

  @Column({ type: 'text', nullable: true })
  error_message: string | null;

  @ManyToOne(() => Reminder, (reminder) => reminder.notification_logs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reminder_id' })
  reminder: Reminder;
}

