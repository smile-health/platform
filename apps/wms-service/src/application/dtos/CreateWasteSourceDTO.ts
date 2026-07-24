export default interface CreateWasteSourceDTO {
    createdAt: Date;
    createdBy: string;
    healthcareFacilityId: number;
    sourceType: 'INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT';
    internalSourceName: string;
    internalTreatmentName: 'PYROLYSIS' | 'DISINFECTION';
    externalHealthcareFacilityId: number;
    externalHealthcareFacilityName: string;
    isActive: boolean;
    isResidue: boolean;
}
