import { Body, Controller, UnauthorizedException, Post } from '@nestjs/common';

import { Public } from '../common/decorators/public.decorator';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('verify')
  async verify(@Body() body: VerifyPinDto) {
    const user = await this.authService.verifyCredentials(body.phone_number, body.pin);

    if (!user) {
      throw new UnauthorizedException('Invalid PIN');
    }

    return { valid: true, user_id: user.id };
  }
}
