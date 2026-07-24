export default class PartnerVehicle {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public entityId: number;
    public entityIds: string | undefined;
    public vehicleType:
        | 'BOX_TRUCK'
        | 'REFRIGERATED_BOX_TRUCK'
        | 'OPEN_BODY_TRUCK'
        | 'TANKER'
        | 'HAZARDOUS_MATERIAL_TRUCK'
        | 'RADIOACTIVE_MATERIAL_TRUCK'
        | 'FLATBED_TRUCK'
        | 'LOADER_TRUCK'
        | 'TRAILER'
        | 'VAN';
    public vehicleNumber: string;
    public capacityInKgs: number;
    public entityName?: string;
    public transporterId?: number;

    constructor(partnerVehicle: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        entityId: number;
        entityIds?: string,
        vehicleType:
            | 'BOX_TRUCK'
            | 'REFRIGERATED_BOX_TRUCK'
            | 'OPEN_BODY_TRUCK'
            | 'TANKER'
            | 'HAZARDOUS_MATERIAL_TRUCK'
            | 'RADIOACTIVE_MATERIAL_TRUCK'
            | 'FLATBED_TRUCK'
            | 'LOADER_TRUCK'
            | 'TRAILER'
            | 'VAN';
        vehicleNumber: string;
        capacityInKgs: number;
        entityName?: string;
        transporterId?: number;
    }) {
        this.id = partnerVehicle.id;
        this.createdAt = partnerVehicle.createdAt;
        this.createdBy = partnerVehicle.createdBy;
        this.updatedAt = partnerVehicle.updatedAt;
        this.updatedBy = partnerVehicle.updatedBy;
        this.entityId = partnerVehicle.entityId;
        this.vehicleType = partnerVehicle.vehicleType;
        this.vehicleNumber = partnerVehicle.vehicleNumber;
        this.capacityInKgs = partnerVehicle.capacityInKgs;
        this.entityName = partnerVehicle.entityName;
        this.transporterId = partnerVehicle.transporterId;
        this.entityIds = partnerVehicle.entityIds;
    }
}

