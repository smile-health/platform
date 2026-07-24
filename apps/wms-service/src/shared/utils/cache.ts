import { UserInfoType } from '../types/authorization';

type CacheItem<T = UserInfoType> = {
    value: T;
    expires: number;
};

const cache = new Map<string, CacheItem>();

/**
 * Sets a value in cache with TTL (Time To Live)
 * @param key Cache key
 * @param value Value to store
 * @param ttl Time to live in minutes (default: 5 minutes)
 */
export function setCache<T>(key: string, value: UserInfoType, ttl: number = 5): void {
    cache.set(key, {
        value,
        expires: Date.now() + ttl * 60 * 1000,
    });
}

/**
 * Gets a value from cache if it exists and isn't expired
 * @param key Cache key
 * @returns The cached value or undefined if not found/expired
 */
export function getCache<T>(key: string): T | undefined {
    const item = cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expires) {
        cache.delete(key);
        return undefined;
    }

    return item.value as T;
}

/**
 * Deletes an item from cache
 * @param key Cache key
 */
export function deleteCache(key: string): void {
    cache.delete(key);
}

/**
 * Clears all cached items
 */
export function clearCache(): void {
    cache.clear();
}

/**
 * Checks if a key exists in cache and isn't expired
 * @param key Cache key
 */
export function hasCache(key: string): boolean {
    return getCache(key) !== undefined;
}

/**
 * Gets all cache keys (including expired ones)
 * @returns Array of keys
 */
export function getCacheKeys(): string[] {
    return Array.from(cache.keys());
}

/**
 * Cleans up expired cache items
 * @returns Number of items removed
 */
export function cleanupCache(): number {
    let count = 0;
    const now = Date.now();

    cache.forEach((value, key) => {
        if (now > value.expires) {
            cache.delete(key);
            count++;
        }
    });

    return count;
}
