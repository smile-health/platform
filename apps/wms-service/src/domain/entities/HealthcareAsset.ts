import AssetModel from './AssetModel';

export default class HealthcareAsset {
  public id: number;
  public healthcareFacilityId: number;
  public assetId?: string | null;
  public assetTypeName: string;
  public assetWorkingStatusName: string;
  public status: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(asset: {
    id: number;
    healthcareFacilityId: number;
    assetId?: string | null;
    assetTypeName: string;
    assetWorkingStatusName: string;
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = asset.id;
    this.healthcareFacilityId = asset.healthcareFacilityId;
    this.assetId = asset.assetId;
    this.createdAt = asset.createdAt;
    this.updatedAt = asset.updatedAt;
    this.assetTypeName = asset.assetTypeName;
    this.assetWorkingStatusName = asset.assetWorkingStatusName;
    this.status = asset.status;
  }
}
