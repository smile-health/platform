import { UserInfo } from '../../shared/types/userInfo';
export interface UserTokenDTO {
    userInfo?: UserInfo | null;
    token?: string;
    userType?: string;
    ttl?: number;
}
