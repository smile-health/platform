export default class UserFcmToken {
    public id: number | undefined;
    public createdAt?: Date;
    public updatedAt?: Date;
    public userId: number;
    public entityId: number;
    public userUuid: string;
    public token: string;

    constructor(data: {
        id?: number;
        userId: number;
        entityId: number;
        userUuid: string;
        token: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.id = data.id;
        this.userId = data.userId;
        this.entityId = data.entityId;
        this.userUuid = data.userUuid;
        this.token = data.token;
        this.createdAt = this.createdAt;
        this.updatedAt = this.updatedAt;
    }
}
