import { UserTokenService } from '../../domain/services/UserTokenService';
import { UserTokenDTO } from '../dtos/UserTokenDTO';

export class CheckToken {
    constructor(private readonly service: UserTokenService) {}

    async execute(dto: UserTokenDTO): Promise<number> {
        if (!dto.token) return -2;
        return await this.service.getTokenTTL(dto.token);
    }

    async executeCache(dto: UserTokenDTO): Promise<boolean> {
        if (!dto.token || !dto.ttl) return false;
        return await this.service.cacheToken(dto.token, dto.ttl, dto?.userType ?? 'user');
    }
}
