export default interface GetHealthcareFacilityAssetDTO {
    id: number;
    createdBy: string;
    updatedBy: string;
    healthcareFacilityId: number;
    modelId: number;
    isIotEnable: boolean;
    assetStatus: 'OPERATIONAL' | 'UNDER_MAINTAINENCE' | 'OUT_OF_SERVICE' | 'IDLE' | 'RETIRED';
    createdAt: Date;
    updatedAt: Date;
    warrantyEndDate: Date;
    yearOfProduction: number;
}
