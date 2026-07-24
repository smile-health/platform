export default interface UpdateWasteSourceDTO {
    id: number;
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
