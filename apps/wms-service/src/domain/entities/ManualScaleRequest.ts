export default class ManualScaleRequest {
    public id: number | undefined;
    public requestedBy: string;
    public processedBy?: string;
    public isActive: boolean;
    public status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_FOR_APPROVAL';
    public approvalType: 'TIME_BOUND' | 'COUNT_BASED';
    public validUntil?: Date;
    public countLimit?: number;
    public entityId: number;
    public createdAt?: Date;
    public updatedAt?: Date;
    public readonly operatorName?: string;
    public readonly processedName?: string;
    public readonly entityName?: string;

    constructor(data: {
        id?: number;
        requestedBy: string;
        processedBy?: string;
        isActive: boolean;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING_FOR_APPROVAL';
        approvalType: 'TIME_BOUND' | 'COUNT_BASED';
        validUntil?: Date;
        countLimit?: number;
        entityId: number;
        createdAt?: Date;
        updatedAt?: Date;
        operatorName?: string;
        processedName?: string;
        entityName?: string;
    }) {
        this.id = data.id;
        this.requestedBy = data.requestedBy;
        this.processedBy = data.processedBy;
        this.isActive = data.isActive;
        this.status = data.status;
        this.approvalType = data.approvalType;
        this.validUntil = data.validUntil;
        this.countLimit = data.countLimit;
        this.entityId = data.entityId;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.operatorName = data.operatorName;
        this.processedName = data.processedName;
        this.entityName = data.entityName;
    }
}
