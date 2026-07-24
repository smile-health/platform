export default interface UpdateAssetDTO {
    id: number;
    updatedAt: string;
    updatedBy: string;
    healthcareFacilityId?: number;
    modelId: number;
    isIotEnable: boolean;
    assetId: string;
    assetStatus: 'OPERATIONAL' | 'UNDER_MAINTAINENCE' | 'OUT_OF_SERVICE' | 'IDLE' | 'RETIRED';
    warrantyStartDate?: Date;
    warrantyEndDate?: Date;
    yearOfProduction?: number;
}
