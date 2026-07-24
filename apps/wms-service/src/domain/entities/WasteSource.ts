export default class WasteSource {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public healthcareFacilityId: number;
    public sourceType: 'INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT';
    public internalSourceName: string;
    public internalTreatmentName: 'PYROLYSIS' | 'DISINFECTION';
    public externalHealthcareFacilityId: number;
    public externalHealthcareFacilityName: string;
    public isActive: boolean;
    public isResidue: boolean;
    public userName?: string;

    constructor(wasteSource: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        healthcareFacilityId: number;
        sourceType: 'INTERNAL' | 'EXTERNAL' | 'INTERNAL_TREATMENT';
        internalSourceName: string;
        internalTreatmentName: 'PYROLYSIS' | 'DISINFECTION';
        externalHealthcareFacilityId: number;
        externalHealthcareFacilityName: string;
        isActive: boolean;
        isResidue: boolean;
        userName?: string;
    }) {
        this.id = wasteSource.id;
        this.createdAt = wasteSource.createdAt;
        this.createdBy = wasteSource.createdBy;
        this.updatedAt = wasteSource.updatedAt;
        this.updatedBy = wasteSource.updatedBy;
        this.healthcareFacilityId = wasteSource.healthcareFacilityId;
        this.sourceType = wasteSource.sourceType;
        this.internalSourceName = wasteSource.internalSourceName;
        this.internalTreatmentName = wasteSource.internalTreatmentName;
        this.externalHealthcareFacilityId = wasteSource.externalHealthcareFacilityId;
        this.externalHealthcareFacilityName = wasteSource.externalHealthcareFacilityName;
        this.isActive = wasteSource.isActive;
        this.isResidue = wasteSource.isResidue;
        this.userName = wasteSource.userName;
    }
}
