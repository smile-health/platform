export interface UserInfoType {
    userInfo: UserInfo;
}

export interface UserInfo {
    sub: string;
    resource_access: ResourceAccess;
    email_verified: boolean;
    realm_access: RealmAccess;
    name: string;
    preferred_username: string;
    appUserId: string;
    given_name: string;
    family_name: string;
    email: string;
    programId: string;
}

export interface ResourceAccess {
    account: Account;
}

export interface Account {
    roles: string[];
}

export interface RealmAccess {
    roles: string[];
}
