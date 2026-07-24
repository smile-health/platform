import { CacheLockingService } from '../../../domain/services/CacheLockingService';
import redis from '../redis.client';

export class RedisLockingImpl implements CacheLockingService {
    async acquireLock(key: string, ttl: number): Promise<boolean> {
        const exists = await redis.exists(key);
        if (exists) {
            return false;
        }
        const result = await redis.set(key, 'locked', 'EX', ttl, 'NX');
        return result === 'OK';
    }

    async isLocked(key: string): Promise<boolean> {
        const exists = await redis.exists(key);
        return exists > 0;
    }

    async releaseLock(key: string): Promise<void> {
        await redis.del(key);
    }
}
