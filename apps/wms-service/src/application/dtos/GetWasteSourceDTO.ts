export interface GetWasteSourceDTO {
    id: number;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    healthcareFacilityId: number;
    sourceType: 'INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT';
    internalSourceName: string;
    internalTreatmentName: 'PYROLYSIS' | 'DISINFECTION';
    externalHealthcareFacilityId: number;
    externalHealthcareFacilityName: string;
    isActive: boolean;
}
