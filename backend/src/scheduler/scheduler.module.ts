import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsModule } from '../notifications/notifications.module';
import { Reminder } from '../reminders/reminder.entity';
import { REMINDERS_QUEUE } from './scheduler.constants';
import { SchedulerProcessor } from './scheduler.processor';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
        const parsedUrl = new URL(redisUrl);

        return {
          redis: {
            host: parsedUrl.hostname,
            port: Number(parsedUrl.port || 6379),
            password: parsedUrl.password || undefined,
            db: parsedUrl.pathname ? Number(parsedUrl.pathname.replace('/', '')) || 0 : 0,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: REMINDERS_QUEUE,
    }),
    TypeOrmModule.forFeature([Reminder]),
    NotificationsModule,
  ],
  providers: [SchedulerService, SchedulerProcessor],
  exports: [SchedulerService],
})
export class SchedulerModule {}

