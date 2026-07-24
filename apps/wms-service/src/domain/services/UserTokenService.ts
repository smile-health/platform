import { UserInfo } from '../../shared/types/userInfo';
export interface UserTokenService {
    cacheUserInfo(token: string, userInfo: UserInfo, ttl: number): Promise<boolean>;
    getUserInfoByToken(token: string): Promise<UserInfo | null>;
    invalidateUserInfo(token: string): Promise<boolean>;
    cacheToken(token: string, ttl: number, userType: string): Promise<boolean>;
    verifyToken(token: string): Promise<boolean>;
    invalidateToken(token: string): Promise<boolean>;
    getTokenTTL(token: string): Promise<number>;
}
