import AssetModel from './AssetModel';

export default class HealthcareFacilityAsset {
    public id: number | undefined;
    public createdBy: string;
    public updatedBy?: string;
    public assetStatus:
        | 'OPERATIONAL'
        | 'UNDER_MAINTAINENCE'
        | 'OUT_OF_SERVICE'
        | 'IDLE'
        | 'RETIRED';
    public healthcareFacilityId: number;
    public assetId: string;
    public modelId: number;
    public isIotEnable: boolean;
    public createdAt: Date;
    public updatedAt?: Date;
    public assetModel?: AssetModel | undefined;
    public healthcareFacilityName?: string;
    public warrantyStartDate?: Date;
    public warrantyEndDate?: Date;
    public yearOfProduction?: number;
    public dateCalibrationActivity?: Date;
    public dateMaintenanceActivity?: Date;
    public entityName?: string;

    constructor(asset: {
        id?: number;
        createdBy: string;
        updatedBy?: string;
        assetStatus: 'OPERATIONAL' | 'UNDER_MAINTAINENCE' | 'OUT_OF_SERVICE' | 'IDLE' | 'RETIRED';
        healthcareFacilityId: number;
        assetId: string;
        modelId: number;
        isIotEnable: boolean;
        createdAt: Date;
        updatedAt?: Date;
        assetModel?: AssetModel;
        healthcareFacilityName?: string;
        warrantyStartDate?: Date;
        warrantyEndDate?: Date;
        yearOfProduction?: number;
        dateCalibrationActivity?: Date;
        dateMaintenanceActivity?: Date;
        entityName?: string;
    }) {
        this.id = asset.id;
        this.assetStatus = asset.assetStatus;
        this.healthcareFacilityId = asset.healthcareFacilityId;
        this.assetId = asset.assetId;
        this.modelId = asset.modelId;
        this.isIotEnable = asset.isIotEnable;
        this.createdBy = asset.createdBy;
        this.updatedBy = asset.updatedBy;
        this.createdAt = asset.createdAt;
        this.updatedAt = asset.updatedAt;
        this.assetModel = asset.assetModel;
        this.healthcareFacilityName = asset.healthcareFacilityName;
        this.warrantyEndDate = asset.warrantyEndDate;
        this.yearOfProduction = asset.yearOfProduction;
        this.dateCalibrationActivity = asset.dateCalibrationActivity;
        this.dateMaintenanceActivity = asset.dateMaintenanceActivity;
        this.entityName = asset.entityName;
        this.warrantyStartDate = asset.warrantyStartDate;
    }
}
