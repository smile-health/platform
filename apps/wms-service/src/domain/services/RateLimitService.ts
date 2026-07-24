export interface RateLimitService {
    setOrIncrCount(userId: string | undefined, window: number): Promise<void>;
    getCount(userId: string | undefined): Promise<number>;
}
