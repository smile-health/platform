import { RateLimitService } from '../../../domain/services/RateLimitService';
import redis from '../redis.client';

export class RateLimiterImpl implements RateLimitService {
    async setOrIncrCount(userId: string | undefined, window: number): Promise<void> {
        const key = `rate-limit:${userId}`;
        const exists = await redis.exists(key);

        if (!exists) {
            await redis.set(key, 1, 'EX', window); // 1-minute window
        } else {
            await redis.incr(key);
        }
    }

    async getCount(userId: string | undefined): Promise<number> {
        const key = `rate-limit:${userId}`;
        const count = await redis.get(key);

        return count ? parseInt(count, 10) : 0;
    }
}
