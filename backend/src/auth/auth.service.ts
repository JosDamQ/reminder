import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  verifyCredentials(phoneNumber: string, pin: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        phone_number: phoneNumber,
        pin,
      },
    });
  }

  verifyUserAccess(userId: string, pin: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id: userId,
        pin,
      },
    });
  }
}
