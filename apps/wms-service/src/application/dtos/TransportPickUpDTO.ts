export default interface TransportPickupDTO {
    token: string;
    wasteTransportationGroupId: number;
    wasteTransportationExternalGroupId: number;
    wasteTransportationExternalGroupIds: number[];
    healthcareFacilityId: number;
    handoverLattitude: number;
    handoverLongitude: number;
    updatedBy: string;
    startTime: Date;
    endTime: Date;
    transporterOperatorId: string;
    transporterId: number;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    isReadOnly?: boolean;
    user: {
        id: number;
        email: string;
        mobile_phone: string;
        fcm_token: string;
        entity_id: number;
        province_id?: number;
        regency_id?: number;
    };
    entity: {
        id: number;
        province_id?: number;
        regency_id?: number;
    };
}
export interface HandoverTreatmentExternalDTO {
    wasteTransportationExternalGroupIds: number[];
    wasteBagQrCodeIds: string[];
    entityId: number;
    treatmentLocationId: number;
    token: string;
    updatedBy: string;
    startTime: Date;
    endTime: Date;
    treatmentId?: number;
    user: {
        id: number;
        email: string;
        mobile_phone: string;
        fcm_token: string;
        entity_id: number;
        province_id?: number;
        regency_id?: number;
    };
    entity: {
        id: number;
        province_id?: number;
        regency_id?: number;
    };
}
