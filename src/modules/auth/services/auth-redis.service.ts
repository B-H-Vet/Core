import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../common/redis/services/redis.service';

@Injectable()
export class AuthRedisService {
  constructor(private readonly redisService: RedisService) {}

  async saveVerificationCode(userId: number, code: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(`verification:${String(userId)}`, code, 'EX', 60 * 10);
  }

  async getVerificationCode(userId: number): Promise<string | null> {
    const client = this.redisService.getClient();
    return await client.get(`verification:${String(userId)}`);
  }

  async deleteVerificationCode(userId: number): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(`verification:${String(userId)}`);
  }
}
