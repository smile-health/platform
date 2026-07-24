export default class WasteBagAuditTrail {
    public id: number | undefined;
    public createdAt: Date;
    public updatedBy?: string;
    public wasteBagId: number;
    public event: string;
    public wasteBagStatus: string;
    public transportStatus: string | null;
    public healthcareFacilityId: number;
    public transporterId: number | null;
    public thirdPartyProviderId: number | null;
    public source: string;
    public isGroup?: boolean;
    public isFailed?: boolean;
    public remarks: string | null;

    constructor(data: {
        id?: number;
        createdAt: Date;
        updatedBy?: string;
        wasteBagId: number;
        event: string;
        wasteBagStatus: string;
        transportStatus: string | null;
        healthcareFacilityId: number;
        transporterId: number | null;
        thirdPartyProviderId: number | null;
        source: string;
        isGroup?: boolean;
        isFailed?: boolean;
        remarks: string | null;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.updatedBy = data.updatedBy;
        this.wasteBagId = data.wasteBagId;
        this.event = data.event;
        this.wasteBagStatus = data.wasteBagStatus;
        this.transportStatus = data.transportStatus;
        this.healthcareFacilityId = data.healthcareFacilityId;
        this.transporterId = data.transporterId;
        this.thirdPartyProviderId = data.thirdPartyProviderId;
        this.source = data.source;
        this.isGroup = data.isGroup;
        this.isFailed = data.isFailed;
        this.remarks = data.remarks;
    }
}
