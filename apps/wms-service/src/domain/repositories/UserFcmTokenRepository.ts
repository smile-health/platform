import UserFcmToken from '../entities/UserFcmToken';

export default interface UserFcmTokenRepository {
    createOrUpdateToken(token: UserFcmToken): Promise<UserFcmToken>;
    getTokenByUserId(id: string, entityId: number): Promise<UserFcmToken | null>;
}
