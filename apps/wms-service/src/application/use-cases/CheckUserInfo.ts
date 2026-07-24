import { UserTokenService } from '../../domain/services/UserTokenService';
import { UserTokenDTO } from '../dtos/UserTokenDTO';
import { UserInfo } from '../../shared/types/userInfo';

export class CheckUserInfo {
    constructor(private readonly service: UserTokenService) {}

    async execute(dto: UserTokenDTO): Promise<UserInfo | null> {
        if (!dto.token) return null;
        return await this.service.getUserInfoByToken(dto.token);
    }

    async cacheUserInfo(dto: UserTokenDTO): Promise<boolean> {
        if (!dto.token || !dto.userInfo || !dto.ttl) return false;
        return await this.service.cacheUserInfo(dto.token, dto.userInfo, dto.ttl);
    }
}
