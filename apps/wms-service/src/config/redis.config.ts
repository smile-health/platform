export default {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
};

export const redisLockConfig = {
    key: process.env.REDIS_SCHEDULED_EVENTS_LOCK_KEY,
    ttl: process.env.REDIS_SCHEDULED_EVENTS_LOCK_KEY_TTL,
    retryInterval: process.env.REDIS_SCHEDULED_EVENTS_LOCK_RETRY_INTERVAL,
    retryCount: process.env.REDIS_SCHEDULED_EVENTS_LOCK_RETRY_COUNT,
};
