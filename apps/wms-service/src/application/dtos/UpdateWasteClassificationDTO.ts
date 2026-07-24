export default interface UpdateWasteClassificationDTO {
    id: number;
    updatedAt?: Date;
    updatedBy?: string;
    regionId: number;
    effectiveFrom: Date;
    effectiveTo: Date;
    wasteTypeId: number;
    wasteGroupId: number;
    wasteCharacteristicsId: number;
    wasteCode: string;
    wasteBagColorCode: 'BLACK' | 'GRAY' | 'YELLOW' | 'PURPLE' | 'BROWN' | 'RED' | 'NONE';
    storageRuleType: 'STATIC' | 'RULE_BASED' | undefined;
    useColdStorage: boolean;
    coldStorageMinHours: number;
    coldStorageMaxHours: number;
    tempStorageMinHours: number;
    tempStorageMaxHours: number;
    minimunDecayDay: number;
    storageRule: string;
    hasMultipleTransporters: boolean;
    allowHealthcareFacilityTreatment: boolean;
    treatmentMethod: string | undefined;
    disposalMethod: string | undefined;
    allowedVehicleTypes: string | undefined;
}
