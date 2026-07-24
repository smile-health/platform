import { RateLimitService } from '../../domain/services/RateLimitService';
import { UserRateLimitDTO } from '../dtos/UserRateLimitDTO';

export class CheckRateLimit {
    constructor(private readonly rateLimitService: RateLimitService) {}

    async execute(dto: UserRateLimitDTO): Promise<boolean> {
        await this.rateLimitService.setOrIncrCount(dto.userId, dto.window);
        const count = await this.rateLimitService.getCount(dto.userId);

        return count <= dto.limit;
    }
}
