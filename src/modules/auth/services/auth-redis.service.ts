import { randomUUID } from 'crypto';

import { Injectable } from '@nestjs/common';

import { RedisService } from '../../../common/redis/services/redis.service';

@Injectable()
export class AuthRedisService {
  constructor(private readonly redisService: RedisService) {}

  async saveVerificationCode(userId: string, code: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.set(`verification:${userId}`, code, 'EX', 60 * 10);
  }

  async getVerificationCode(userId: string): Promise<string | null> {
    const client = this.redisService.getClient();
    return await client.get(`verification:${userId}`);
  }

  async deleteVerificationCode(userId: string): Promise<void> {
    const client = this.redisService.getClient();
    await client.del(`verification:${userId}`);
  }

  // --- Refresh Token (opaque, rotación) ---

  async createRefreshToken(
    userId: string,
    ttlSeconds = 7 * 24 * 60 * 60,
  ): Promise<string> {
    const tokenId = randomUUID();
    const key = `refresh:${userId}:${tokenId}`;
    const client = this.redisService.getClient();
    await client.set(key, '1', 'EX', ttlSeconds);
    return tokenId;
  }

  async validateRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<boolean> {
    const key = `refresh:${userId}:${tokenId}`;
    const client = this.redisService.getClient();
    const value = await client.get(key);
    return value === '1';
  }

  async revokeRefreshToken(userId: string, tokenId: string): Promise<void> {
    const key = `refresh:${userId}:${tokenId}`;
    const client = this.redisService.getClient();
    await client.del(key);
  }

  async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`;
    const client = this.redisService.getClient();
    const stream = client.scanStream({ match: pattern, count: 100 });

    const keys: string[] = [];
    for await (const chunk of stream) {
      keys.push(...(chunk as string[]));
    }

    if (keys.length > 0) {
      await client.del(...keys);
    }
  }
}
