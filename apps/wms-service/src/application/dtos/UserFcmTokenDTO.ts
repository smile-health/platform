export default interface UserFcmTokenDTO {
    id?: number;
    userId: number;
    entityId: number;
    userUuid: string;
    token: string;
    createdAt?: Date;
    updatedAt?: Date;
}
