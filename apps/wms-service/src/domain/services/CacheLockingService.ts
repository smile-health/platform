export interface CacheLockingService {
    acquireLock(key: string, ttl: number): Promise<boolean>;
    releaseLock(key: string): Promise<void>;
    isLocked(key: string): Promise<boolean>;
}
