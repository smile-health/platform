export default class Disposal {
    public id: number | undefined;
    public bastNo: string;
    public description?: string;
    public createdBy: string;
    public createdName?: string;
    public entityId: number;
    public entityName?: string;
    public status: 'PENDING' | 'APPROVED' | 'REJECTED';
    public isRead: boolean;
    public approvedBy?: string;
    public rejectedBy?: string;
    public rejectedReason?: string;
    public approvedAt?: Date;
    public rejectedAt?: Date;
    public createdAt?: Date;

    constructor(data: {
        id?: number;
        bastNo: string;
        description?: string;
        createdBy: string;
        createdName?: string;
        entityId: number;
        entityName?: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        isRead: boolean;
        approvedBy?: string;
        rejectedBy?: string;
        rejectedReason?: string;
        approvedAt?: Date;
        rejectedAt?: Date;
        createdAt?: Date;
    }) {
        this.id = data.id;
        this.bastNo = data.bastNo;
        this.description = data.description;
        this.createdBy = data.createdBy;
        this.createdName = data.createdName;
        this.entityId = data.entityId;
        this.entityName = data.entityName;
        this.status = data.status;
        this.isRead = data.isRead;
        this.approvedBy = data.approvedBy;
        this.rejectedBy = data.rejectedBy;
        this.rejectedReason = data.rejectedReason;
        this.approvedAt = data.approvedAt;
        this.rejectedAt = data.rejectedAt;
        this.createdAt = data.createdAt;
    }
}
