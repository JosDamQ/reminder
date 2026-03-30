import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from '../../auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class StaticPinAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = this.extractUserId(request.headers);
    const pin = this.extractPin(request.headers);

    if (!userId || !pin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authService.verifyUserAccess(userId, pin);

    if (!user) {
      throw new UnauthorizedException('Invalid PIN');
    }

    request.user = user;

    return true;
  }

  private extractUserId(headers: Record<string, string | string[] | undefined>): string | null {
    const headerUserId = headers['x-user-id'];
    if (typeof headerUserId === 'string' && headerUserId.trim().length > 0) {
      return headerUserId.trim();
    }

    return null;
  }

  private extractPin(headers: Record<string, string | string[] | undefined>): string | null {
    const headerPin = headers['x-user-pin'];
    if (typeof headerPin === 'string' && headerPin.trim().length > 0) {
      return headerPin.trim();
    }

    const authorization = headers.authorization;
    if (typeof authorization !== 'string') {
      return null;
    }

    const [scheme, value] = authorization.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && value?.trim()) {
      return value.trim();
    }

    return null;
  }
}
