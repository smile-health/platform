import { UserTokenService } from '../../domain/services/UserTokenService';
import { UserTokenDTO } from '../dtos/UserTokenDTO';

export class DeleteUserToken {
    constructor(private readonly service: UserTokenService) {}

    async execute(dto: UserTokenDTO): Promise<boolean> {
        if (!dto.token) return false;
        return await this.service.invalidateToken(dto.token);
    }

    async executeUserInfo(dto: UserTokenDTO): Promise<boolean> {
        if (!dto.token) return false;
        return await this.service.invalidateUserInfo(dto.token);
    }
}
