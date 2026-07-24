export interface SpeedLocation {
    provinceId: number | null;
    provinceName: string | null;
    regencyId: number | null;
    regencyName: string | null;
    districtId: number | null;
    districtName: string | null;
}

export interface SpeedWasteClassification {
    id: number;
    wasteTypeId: number;
    wasteTypeName: string | null;
    wasteGroupId: number;
    wasteGroupName: string | null;
    wasteCharacteristicId: number;
    wasteCharacteristicName: string | null;
    wasteCode: string;
    wasteBagColorCode: string;
    useColdStorage: boolean;
}

export interface SpeedWasteLogHistoryEntry {
    status: string;
    action: string;
    date: Date;
}

export interface SpeedWasteData {
    id: number;
    wasteBagCode: string;
    entityId: number;
    entityName: string | null;
    // Only resolved/set for the by-code detail lookup, not the list — same "detail-only" pattern
    // as logHistory. `undefined` means "not fetched for this call", not "no NIB".
    entityNib?: string | null;
    location: SpeedLocation;
    wasteClassification: SpeedWasteClassification | null;
    transporterId: number | null;
    transporterName: string | null;
    thirdPartyId: number | null;
    thirdPartyName: string | null;
    vehicleNumber: string | null;
    ownedBy: string;
    weightInKgs: number | null;
    weightInTons: number | null;
    wasteStatus: string;
    wasteStatusUpdatedAt: Date | null;
    wasteStatusUpdatedBy: string | null;
    transportationStatus: string | null;
    transportationStatusUpdatedAt: Date | null;
    transportationStatusUpdatedBy: string | null;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
    scaleMethod: string;
    storageStartTimestamp: Date | null;
    scheduledStorageEndDatetime: Date | null;
    actualStorageEndDatetime: Date | null;
    maxStorageHours: number | null;
    minimumStorageHours: number | null;
    isTreated: boolean;
    isDisposed: boolean;
    binNumber: string | null;
    iotMethod: string | null;
    manifestDocNumber: string | null;
    manifestDocPath: string | null;
    treatmentStartTime: Date | null;
    treatmentEndTime: Date | null;
    treatmentLocationId: number | null;
    bastNo: string | null;
    logHistory?: SpeedWasteLogHistoryEntry[];
}

export default class SpeedWaste implements SpeedWasteData {
    public id: number;
    public wasteBagCode: string;
    public entityId: number;
    public entityName: string | null;
    public entityNib?: string | null;
    public location: SpeedLocation;
    public wasteClassification: SpeedWasteClassification | null;
    public transporterId: number | null;
    public transporterName: string | null;
    public thirdPartyId: number | null;
    public thirdPartyName: string | null;
    public vehicleNumber: string | null;
    public ownedBy: string;
    public weightInKgs: number | null;
    public weightInTons: number | null;
    public wasteStatus: string;
    public wasteStatusUpdatedAt: Date | null;
    public wasteStatusUpdatedBy: string | null;
    public transportationStatus: string | null;
    public transportationStatusUpdatedAt: Date | null;
    public transportationStatusUpdatedBy: string | null;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | null;
    public updatedBy: string | null;
    public scaleMethod: string;
    public storageStartTimestamp: Date | null;
    public scheduledStorageEndDatetime: Date | null;
    public actualStorageEndDatetime: Date | null;
    public maxStorageHours: number | null;
    public minimumStorageHours: number | null;
    public isTreated: boolean;
    public isDisposed: boolean;
    public binNumber: string | null;
    public iotMethod: string | null;
    public manifestDocNumber: string | null;
    public manifestDocPath: string | null;
    public treatmentStartTime: Date | null;
    public treatmentEndTime: Date | null;
    public treatmentLocationId: number | null;
    public bastNo: string | null;
    public logHistory?: SpeedWasteLogHistoryEntry[];

    constructor(data: SpeedWasteData) {
        this.id = data.id;
        this.wasteBagCode = data.wasteBagCode;
        this.entityId = data.entityId;
        this.entityName = data.entityName;
        this.entityNib = data.entityNib;
        this.location = data.location;
        this.wasteClassification = data.wasteClassification;
        this.transporterId = data.transporterId;
        this.transporterName = data.transporterName;
        this.thirdPartyId = data.thirdPartyId;
        this.thirdPartyName = data.thirdPartyName;
        this.vehicleNumber = data.vehicleNumber;
        this.ownedBy = data.ownedBy;
        this.weightInKgs = data.weightInKgs;
        this.weightInTons = data.weightInTons;
        this.wasteStatus = data.wasteStatus;
        this.wasteStatusUpdatedAt = data.wasteStatusUpdatedAt;
        this.wasteStatusUpdatedBy = data.wasteStatusUpdatedBy;
        this.transportationStatus = data.transportationStatus;
        this.transportationStatusUpdatedAt = data.transportationStatusUpdatedAt;
        this.transportationStatusUpdatedBy = data.transportationStatusUpdatedBy;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.scaleMethod = data.scaleMethod;
        this.storageStartTimestamp = data.storageStartTimestamp;
        this.scheduledStorageEndDatetime = data.scheduledStorageEndDatetime;
        this.actualStorageEndDatetime = data.actualStorageEndDatetime;
        this.maxStorageHours = data.maxStorageHours;
        this.minimumStorageHours = data.minimumStorageHours;
        this.isTreated = data.isTreated;
        this.isDisposed = data.isDisposed;
        this.binNumber = data.binNumber;
        this.iotMethod = data.iotMethod;
        this.manifestDocNumber = data.manifestDocNumber;
        this.manifestDocPath = data.manifestDocPath;
        this.treatmentStartTime = data.treatmentStartTime;
        this.treatmentEndTime = data.treatmentEndTime;
        this.treatmentLocationId = data.treatmentLocationId;
        this.bastNo = data.bastNo;
        this.logHistory = data.logHistory;
    }
}
