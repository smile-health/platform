export default class WasteTransportationGroup {
    public id: number | undefined;
    public createdAt: Date | undefined;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public totalBagsCount?: number;
    public totalWeightInKgs?: number;
    public transporterVehicleId?: number;
    public transporterOperatorId?: string;
    public handoverLattitude?: number;
    public handoverLongitude?: number;
    public transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED';
    public handoverTimestamp?: Date;
    public isReadOnly?: boolean;
    public groupId?: string;
    public wasteBags?: any;
    public wasteClassification?: any;
    public partnership?: any;
    public vehicle?: any;

    constructor(data: {
        id?: number;
        createdAt?: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        totalBagsCount?: number;
        totalWeightInKgs?: number;
        transporterVehicleId?: number;
        transporterOperatorId?: string;
        handoverLattitude?: number;
        handoverLongitude?: number;
        transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED';
        handoverTimestamp?: Date;
        isReadOnly?: boolean;
        groupId?: string;
        wasteBags?: any;
        wasteClassification?: any;
        partnership?: any;
        vehicle?: any;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.totalBagsCount = data.totalBagsCount;
        this.totalWeightInKgs = data.totalWeightInKgs;
        this.transporterVehicleId = data.transporterVehicleId;
        this.transporterOperatorId = data.transporterOperatorId;
        this.handoverLattitude = data.handoverLattitude;
        this.handoverLongitude = data.handoverLongitude;
        this.transportationStatus = data.transportationStatus;
        this.handoverTimestamp = data.handoverTimestamp;
        this.isReadOnly = data.isReadOnly;
        this.groupId = data.groupId;
        this.wasteBags = data.wasteBags;
        this.wasteClassification = data.wasteClassification;
        this.partnership = data.partnership;
        this.vehicle = data.vehicle;
    }
}
