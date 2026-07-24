import { Readable } from 'stream';
import UserFcmTokenDTO from '../../dtos/UserFcmTokenDTO';
import UserFcmTokenRepository from '../../../domain/repositories/UserFcmTokenRepository';
import UserFcmToken from '../../../domain/entities/UserFcmToken';

export default class CreateOrUpdateUserFcmTokenUseCase {
    constructor(private readonly repo: UserFcmTokenRepository) {}

    async execute(data: UserFcmTokenDTO): Promise<UserFcmToken> {
        try {
            const payload = new UserFcmToken({
                id: data.id,
                userId: data.userId,
                entityId: data.entityId,
                userUuid: data.userUuid,
                token: data.token,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            });
            return await this.repo.createOrUpdateToken(payload);
        } catch (error) {
            console.error('Error deleting waste bag qr code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
