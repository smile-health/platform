import { WasteBagTreatmentGroupModelAttributes } from '../../infrastructure/database/models/WasteBagTreatmentGroupModel';

export default class WasteBagTreatmentRequest {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    public treatmentGroupId: number;
    public requestCreatorId: number | undefined;
    public requestApproverId: number | undefined;
    public wasteBagTreatmentGroup: WasteBagTreatmentGroupModelAttributes | undefined;

    constructor(data: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
        treatmentGroupId: number;
        requestCreatorId?: number;
        requestApproverId?: number;
        wasteBagTreatmentGroup?: WasteBagTreatmentGroupModelAttributes;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedBy = data.updatedBy;
        this.updatedAt = data.updatedAt ?? undefined;
        this.requestStatus = data.requestStatus;
        this.treatmentGroupId = data.treatmentGroupId ?? undefined;
        this.requestCreatorId = data.requestCreatorId ?? undefined;
        this.requestApproverId = data.requestApproverId ?? undefined;
        this.wasteBagTreatmentGroup = data.wasteBagTreatmentGroup;
    }
}
