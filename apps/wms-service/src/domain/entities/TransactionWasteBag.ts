export default class ReportTransactionWasteBag {
    public id: number | undefined;
    public createdAt: Date;
    public healthcareName?: string;
    public wasteCode?: string;
    public qrCode?: string;
    public wasteTypeName?: string;
    public wasteGroupName?: string;
    public wasteCharacteristicsName?: string;
    public wasteSourceName?: string;
    public provinceName?: string;
    public wasteTreatment?: string;
    public wasteStatusUpdatedAt?: Date;
    public wasteStatus:
        | 'IN_TEMPORARY_STORAGE'
        | 'IN_COLD_STORAGE'
        | 'INCINERATION_IN_PROCESS'
        | 'STERILIZATION_IN_PROCESS'
        | 'INCINERATED'
        | 'STERILISED'
        | 'READY_FOR_TRANSPORT'
        | 'IN_TRANSIT'
        | 'TREATED'
        | 'RECYCLED'
        | 'LANDFILLED'
        | 'COLLECTED'
        | 'DISPOSED';
    public weightInKgs?: number;
    public actualStorageEndDatetime: Date | undefined;
    public thirdPartyName?: string;
    public transporterName?: string;
    public healthcareFacilityId: number;
    public wasteSourceId: number;
    public wasteClassificationId: number;
    public transporterId: number | undefined;
    public thirdPartyId: number | undefined;
    public wasteGroupNumber?: string;
    public checkInDate?: string;
    public checkOutDate?: string;
    public storageMax?: number;
    public weightOutKgs?: number;
    public manifestDocNumber?: string;

    constructor(wasteBag: {
        id?: number;
        createdAt: Date;
        healthcareName?: string;
        wasteCode?: string;
        qrCode?: string;
        wasteTypeName?: string;
        wasteGroupName?: string;
        wasteCharacteristicsName?: string;
        wasteSourceName?: string;
        provinceName?: string;
        wasteTreatment?: string;
        wasteStatusUpdatedAt?: Date;
        wasteStatus:
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'IN_TRANSIT'
            | 'TREATED'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED';
        weightInKgs?: number;
        actualStorageEndDatetime?: Date;
        thirdPartyName?: string;
        healthcareFacilityId: number;
        wasteSourceId: number;
        wasteClassificationId: number;
        transporterId?: number;
        thirdPartyId?: number;
        wasteGroupNumber?: string;
        checkInDate?: string;
        checkOutDate?: string;
        storageMax?: number;
        weightOutKgs?: number;
        manifestDocNumber?: string;
    }) {
        this.id = wasteBag.id;
        this.createdAt = wasteBag.createdAt;
        this.wasteStatusUpdatedAt = wasteBag.wasteStatusUpdatedAt;
        this.healthcareName = wasteBag.healthcareName ?? undefined;
        this.wasteCode = wasteBag.wasteCode ?? undefined;
        this.qrCode = wasteBag.qrCode ?? undefined;
        this.wasteTypeName = wasteBag.wasteTypeName ?? undefined;
        this.wasteGroupName = wasteBag.wasteGroupName;
        this.wasteCharacteristicsName = wasteBag.wasteCharacteristicsName;
        this.wasteSourceName = wasteBag.wasteSourceName;
        this.provinceName = wasteBag.provinceName ?? undefined;
        this.wasteTreatment = wasteBag.wasteTreatment;
        this.wasteStatus = wasteBag.wasteStatus;
        this.weightInKgs = wasteBag.weightInKgs;
        this.actualStorageEndDatetime = wasteBag.actualStorageEndDatetime ?? undefined;
        this.thirdPartyName = wasteBag.thirdPartyName ?? undefined;
        this.actualStorageEndDatetime = wasteBag.actualStorageEndDatetime ?? undefined;
        this.healthcareFacilityId = wasteBag.healthcareFacilityId;
        this.wasteSourceId = wasteBag.wasteSourceId;
        this.wasteClassificationId = wasteBag.wasteClassificationId;
        this.transporterId = wasteBag.transporterId;
        this.thirdPartyId = wasteBag.thirdPartyId;
        this.wasteGroupNumber = wasteBag.wasteGroupNumber;
        this.checkInDate = wasteBag.checkInDate;
        this.checkOutDate = wasteBag.checkOutDate;
        this.storageMax = wasteBag.storageMax;
        this.weightOutKgs = wasteBag.weightOutKgs;
        this.manifestDocNumber = wasteBag.manifestDocNumber;
    }
}
