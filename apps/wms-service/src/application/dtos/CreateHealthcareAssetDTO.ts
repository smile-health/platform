export default interface CreateHealthcareAssetDTO {
    id: number,
    updatedAt: Date;
    createdAt: Date;
    healthcareFacilityId: number;
    assetId?: string;
    assetWorkingStatusName: string;
    assetTypeName: string;
    status: boolean;
}
