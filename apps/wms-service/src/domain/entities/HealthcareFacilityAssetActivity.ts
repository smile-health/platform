export default class HealthcareFacilityAssetActivity {
    public createdBy: string;
    public activityType: 'MAINTENANCE' | 'CALIBRATION';
    public hfAssetId: number;
    public operatorId: string;
    public createdAt: Date;
    public startDate: Date;
    public endDate?: Date | undefined;

    constructor(model: {
        createdBy: string;
        activityType: 'MAINTENANCE' | 'CALIBRATION';
        hfAssetId: number;
        operatorId: string;
        createdAt: Date;
        startDate: Date;
        endDate?: Date;
    }) {
        this.activityType = model.activityType;
        this.operatorId = model.operatorId;
        this.hfAssetId = model.hfAssetId;
        this.createdBy = model.createdBy;
        this.createdAt = model.createdAt;
        this.startDate = model.startDate;
        this.endDate = model.endDate ?? undefined;
    }
}
