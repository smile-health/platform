export default interface UpdateHealthcareAssetDTO {
    updatedAt: Date;
    createdAt: Date;
    healthcareFacilityId: number;
    assetId?: string;
    assetTypeName: string;
    status: boolean;
    id?: number,
    assetWorkingStatusName: string,

}
