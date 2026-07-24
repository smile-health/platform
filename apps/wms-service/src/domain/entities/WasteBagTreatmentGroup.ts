import { WasteBagModelAttributes } from '../../infrastructure/database/models/WasteBagModel';
export default class WasteTreatmentGroup {
    public id: number | undefined;
    public createdBy?: string;
    public updatedBy?: string;
    public createdAt?: Date;
    public updatedAt?: Date;
    public totalBagsCount: number;
    public totalWeightInKgs: number;
    public treatmentAssetId?: number;
    public treatmentOperatorId?: number;
    public handoverLattitude?: number;
    public handoverLongitude?: number;
    public treatmentStatus:
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INTERNAL_LANDFILL_IN_PROCESS'
        | 'INTERNAL_LANDFILLED'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED';
    public handoverTimestamp?: Date;
    public isReadOnly?: boolean;
    public groupId?: string;
    public readonly wasteBags?: WasteBagModelAttributes[];
    public wasteType?: any;
    public wasteGroup?: any;
    public wasteCharacteristics?: any[];
    public partnership?: any;
    public vehicle?: any;
    public processWastebagEnd?: string[];

    constructor(data: {
        id?: number;
        createdBy?: string;
        updatedBy?: string;
        createdAt?: Date;
        updatedAt?: Date;
        totalBagsCount: number;
        totalWeightInKgs: number;
        treatmentAssetId?: number;
        treatmentOperatorId?: number;
        handoverLattitude?: number;
        handoverLongitude?: number;
        treatmentStatus:
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INTERNAL_LANDFILL_IN_PROCESS'
            | 'INTERNAL_LANDFILLED'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED';
        handoverTimestamp?: Date;
        isReadOnly?: boolean;
        groupId?: string;
        wasteBags?: any;
        wasteType?: any;
        wasteGroup?: any;
        wasteCharacteristics?: any[];
        partnership?: any;
        vehicle?: any;
        processWastebagEnd?: string[];
    }) {
        this.id = data.id;
        this.createdBy = data.createdBy;
        this.updatedBy = data.updatedBy;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
        this.totalBagsCount = data.totalBagsCount;
        this.totalWeightInKgs = data.totalWeightInKgs;
        this.treatmentAssetId = data.treatmentAssetId;
        this.treatmentOperatorId = data.treatmentOperatorId;
        this.handoverLattitude = data.handoverLattitude;
        this.handoverLongitude = data.handoverLongitude;
        this.treatmentStatus = data.treatmentStatus;
        this.handoverTimestamp = data.handoverTimestamp;
        this.isReadOnly = data.isReadOnly;
        this.groupId = data.groupId;
        this.wasteBags = data.wasteBags;
        this.wasteType = data.wasteType;
        this.wasteGroup = data.wasteGroup;
        this.wasteCharacteristics = data.wasteCharacteristics;
        this.partnership = data.partnership;
        this.vehicle = data.vehicle;
        this.processWastebagEnd = data.processWastebagEnd;
    }
}

export class WasteTreatmentGroupSelectDto {
    public id: number;
    public groupId: string;
    constructor(data: { id: number; groupId: string }) {
        this.id = data.id;
        this.groupId = data.groupId;
    }
}
