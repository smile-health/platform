export default class DashboardWasteHierarchy {
    healthcareFacilityId?: number | string;
    [key: string]: any;
}
export class DashboardHealthcare {
    public wasteGroupNumber?: string;
    public wasteTypeName?: string;
    public wasteGroupName?: string;
    public wasteCharacteristicsName?: string;
    public wasteSource?: string;
    public wasteInDate?: Date;
    public storageDateLimit?: Date;
    public totalWeightInKgs?: number;
    public lastFollowUp?: string;
    public healthcareFacilityId?: number;
    public wasteTypeId?: number;
    public wasteGroupId?: number;
    public wasteCharacteristicsId?: number;
    public transporterOperatorId?: string;
    public treatmentOperatorId?: string;
    public transporterOperatorName?: string;
    public treatmentOperatorName?: string;
    public treatmentType?: string;

    constructor(wasteBag: {
        wasteGroupNumber?: string;
        wasteTypeName?: string;
        wasteGroupName?: string;
        wasteCharacteristicsName?: string;
        wasteSource?: string;
        wasteInDate?: Date;
        storageDateLimit?: Date;
        totalWeightInKgs?: number;
        lastFollowUp?: string;
        healthcareFacilityId?: number;
        wasteTypeId?: number;
        wasteGroupId?: number;
        wasteCharacteristicsId?: number;
        transporterOperatorId?: string;
        treatmentOperatorId?: string;
        transporterOperatorName?: string;
        treatmentOperatorName?: string;
        treatmentType?: string;
    }) {
        this.wasteGroupNumber = wasteBag.wasteGroupNumber;
        this.wasteTypeName = wasteBag.wasteTypeName;
        this.wasteGroupName = wasteBag.wasteGroupName;
        this.wasteCharacteristicsName = wasteBag.wasteCharacteristicsName;
        this.wasteSource = wasteBag.wasteSource;
        this.wasteInDate = wasteBag.wasteInDate;
        this.storageDateLimit = wasteBag.storageDateLimit;
        this.totalWeightInKgs = wasteBag.totalWeightInKgs;
        this.lastFollowUp = wasteBag.lastFollowUp;
        this.healthcareFacilityId = wasteBag.healthcareFacilityId;
        this.wasteTypeId = wasteBag.wasteTypeId;
        this.wasteGroupId = wasteBag.wasteGroupId;
        this.wasteCharacteristicsId = wasteBag.wasteCharacteristicsId;
        this.transporterOperatorId = wasteBag.transporterOperatorId;
        this.treatmentOperatorId = wasteBag.treatmentOperatorId;
        this.transporterOperatorName = wasteBag.transporterOperatorName;
        this.treatmentOperatorName = wasteBag.treatmentOperatorName;
        this.treatmentType = wasteBag.treatmentType;
    }
}

export class DashboardThirdParty {
    public wasteGroupId?: number;
    public wasteGroupNumber?: string;
    public totalWeightInKgs?: number;
    public healthcareFacilityId?: number;
    public vehicleNumber?: string;
    public provinceId?: number;
    public cityId?: number;
    public transporterOperatorId?: string;
    public treatmentOperatorId?: string;
    public transporterOperatorName?: string;
    public treatmentOperatorName?: string;
    public manifestNumber?: string;
    public healthcareName?: string;

    constructor(wasteBag: {
        wasteGroupId?: number;
        wasteGroupNumber?: string;
        totalWeightInKgs?: number;
        healthcareFacilityId?: number;
        vehicleNumber?: string;
        provinceId?: number;
        cityId?: number;
        transporterOperatorId?: string;
        treatmentOperatorId?: string;
        transporterOperatorName?: string;
        treatmentOperatorName?: string;
        manifestNumber?: string;
        healthcareName?: string;
    }) {
        this.wasteGroupId = wasteBag.wasteGroupId;
        this.wasteGroupNumber = wasteBag.wasteGroupNumber;
        this.totalWeightInKgs = wasteBag.totalWeightInKgs;
        this.healthcareFacilityId = wasteBag.healthcareFacilityId;
        this.vehicleNumber = wasteBag.vehicleNumber;
        this.provinceId = wasteBag.provinceId;
        this.cityId = wasteBag.cityId;
        this.transporterOperatorId = wasteBag.transporterOperatorId;
        this.treatmentOperatorId = wasteBag.treatmentOperatorId;
        this.transporterOperatorName = wasteBag.transporterOperatorName;
        this.treatmentOperatorName = wasteBag.treatmentOperatorName;
        this.manifestNumber = wasteBag.manifestNumber;
        this.healthcareName = wasteBag.healthcareName;
    }
}

export class DashboardWasteGroupDetailsByAction {
    public wasteStatus?: string;
    public updatedAtStatus?: string;

    constructor(wasteBag: { wasteStatus?: string; updatedAtStatus?: string }) {
        this.wasteStatus = wasteBag.wasteStatus;
        this.updatedAtStatus = wasteBag.updatedAtStatus;
    }
}

export class DashboardWasteCharacteristicsSummary {
    public wasteGroupName?: string;
    public wasteCharacteristicsName?: string;
    public wasteCode?: string;
    public totalWasteBag?: number;
    public totalWeight?: number;

    constructor(wasteBag: {
        wasteGroupName?: string;
        wasteCharacteristicsName?: string;
        wasteCode?: string;
        totalWasteBag?: number;
        totalWeight?: number;
    }) {
        this.wasteGroupName = wasteBag.wasteGroupName;
        this.wasteCharacteristicsName = wasteBag.wasteCharacteristicsName;
        this.wasteCode = wasteBag.wasteCode;
        this.totalWasteBag = wasteBag.totalWasteBag;
        this.totalWeight = wasteBag.totalWeight;
    }
}
