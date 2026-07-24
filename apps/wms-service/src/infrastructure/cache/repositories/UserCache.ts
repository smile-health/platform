import { UserTokenService } from '../../../domain/services/UserTokenService';
import redis from '../redis.client';
import { UserInfo } from '../../../shared/types/userInfo';

export class UserTokenServiceImpl implements UserTokenService {
    async cacheUserInfo(token: string, userInfo: UserInfo, ttl: number): Promise<boolean> {
        try {
            const TOKEN_PREFIX = token.split('.')[1];

            const cacheKey = `user:${TOKEN_PREFIX}`;

            const result = await redis.set(cacheKey, JSON.stringify(userInfo), 'EX', ttl);

            return result === 'OK';
        } catch (error) {
            console.error(
                'Redis cache error:',
                error instanceof Error ? error.message : String(error),
            );
            throw error;
        }
    }
    async getUserInfoByToken(token: string): Promise<UserInfo | null> {
        try {
            const TOKEN_PREFIX = token.split('.')[1];

            const keys = await redis.keys(`user:${TOKEN_PREFIX}`);

            if (!keys || keys.length === 0) {
                return null;
            }

            const cacheKey = `user:${TOKEN_PREFIX}`;

            const userInfoJson = await redis.get(cacheKey);

            return userInfoJson ? JSON.parse(userInfoJson) : null;
        } catch (error) {
            console.error(
                'Redis getUserId error:',
                error instanceof Error ? error.message : String(error),
            );
            throw error;
        }
    }

    async invalidateUserInfo(token: string): Promise<boolean> {
        try {
            const TOKEN_PREFIX = token.split('.')[1];

            const pattern = `user:${TOKEN_PREFIX}`;
            const keys = await redis.keys(pattern);

            if (keys.length === 0) {
                return false; // No keys found to delete
            }

            const deletedCount = await redis.del(keys);

            return deletedCount > 0;
        } catch (error) {
            console.error(
                'Redis Userid invalidation error:',
                error instanceof Error ? error.message : String(error),
            );
            throw error;
        }
    }
    async cacheToken(token: string, ttl: number, userType: string): Promise<boolean> {
        const key = `token:${token}`;
        const result = await redis.set(key, 'valid', 'EX', ttl);
        return result === 'OK';
    }
    async verifyToken(token: string): Promise<boolean> {
        const result = await redis.get(`token:${token}`);
        return result === 'valid';
    }
    async invalidateToken(token: string): Promise<boolean> {
        await redis.del(`token:${token}`);

        const ttl = await redis.ttl(`token:${token}`);

        if (ttl > 0) {
            const result = await redis.set(`blacklist:${token}`, 'invalid', 'EX', ttl);
            return result === 'OK';
        }
        return true;
    }
    async getTokenTTL(token: string): Promise<number> {
        try {
            return await redis.ttl(`token:${token}`);
        } catch (error) {
            console.error(
                'Redis TTL check error:',
                error instanceof Error ? error.message : String(error),
            );
            return -2;
        }
    }
}
