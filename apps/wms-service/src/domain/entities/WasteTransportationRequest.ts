import { WasteTransportationGroupAttributes } from '../../infrastructure/database/models/WasteTransportationGroupModel';
export default class WasteTransportationRequest {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public requestStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | undefined;
    public transportationGroupId: number;
    public requestCreatorId: number | undefined;
    public requestApproverId: number | undefined;
    public transportationGroup: WasteTransportationGroupAttributes | undefined;

    constructor(wasteSource: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
        transportationGroupId: number;
        requestCreatorId?: number;
        requestApproverId?: number;
        transportationGroup?: WasteTransportationGroupAttributes;
    }) {
        this.id = wasteSource.id;
        this.createdAt = wasteSource.createdAt;
        this.createdBy = wasteSource.createdBy;
        this.updatedAt = wasteSource.updatedAt;
        this.updatedBy = wasteSource.updatedBy;
        this.requestStatus = wasteSource.requestStatus;
        this.transportationGroupId = wasteSource.transportationGroupId;
        this.requestCreatorId = wasteSource.requestCreatorId;
        this.requestApproverId = wasteSource.requestApproverId;
        this.transportationGroup = wasteSource.transportationGroup;
    }
}
