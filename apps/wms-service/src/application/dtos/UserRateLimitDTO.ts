export interface UserRateLimitDTO {
    userId?: string;
    window: number; // in seconds
    limit: number; // max requests allowed in the window
}
