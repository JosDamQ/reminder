import { Controller, Post } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test')
  test(@CurrentUser() user: User) {
    return this.notificationsService.sendTestNotification(user);
  }
}

