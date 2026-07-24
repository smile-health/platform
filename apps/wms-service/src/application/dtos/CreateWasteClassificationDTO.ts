export default interface CreateWasteClassificationDTO {
    createdAt: Date;
    createdBy: string;
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
    allowHealthcareFacilityTreatment: boolean;
    isActive: boolean;
    hasMultipleTransporters: boolean;
    treatmentMethod: string | undefined;
    disposalMethod: string | undefined;
    allowedVehicleTypes: string | undefined;
}
