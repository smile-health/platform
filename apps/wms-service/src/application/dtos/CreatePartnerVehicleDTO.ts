export default interface CreatePartnerVehicleDTO {
    // id?: number;
    // updatedBy?: string;
    createdBy: string;
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
    entityId: number;
    transporterId?: number;
}

export interface CreateMultipleHealthcarePartnerVehicleDTO {
    // id?: number;
    // updatedBy?: string;
    createdBy: string;
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
    entityId: number;
    entityIds: string;
    transporterId?: number;
}
