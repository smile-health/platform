import UserFcmToken from '../../../domain/entities/UserFcmToken';
import UserFcmTokenRepository from '../../../domain/repositories/UserFcmTokenRepository';
export default class GetUserFcmTokenUseCase {
    constructor(private readonly repo: UserFcmTokenRepository) {}

    async execute(id: string, entityId: number): Promise<UserFcmToken | null> {
        try {
            if (!id || !entityId) {
                throw new Error('ID and entity ID are required to get a user FCM token');
            }
            const data = await this.repo.getTokenByUserId(id, entityId);
            return data;
        } catch (error) {
            console.error('Error fetching all waste bag history:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
