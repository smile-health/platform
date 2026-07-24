interface ExpressFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export default interface TransportHandoverDTO {
    wasteBagQrCodeIds: string[];
    wasteTransportationGroupId: number[];
    wasteTransportationExternalGroupId: number[];
    handoverLattitude: number;
    handoverLongitude: number;
    vehicleNumber: string;
    handoverTimestamp: Date;
    manifestDocNumber: string;
    healthcareFacilityId: number;
    file: ExpressFile;
    updatedBy: string;
    startTime: Date;
    endTime: Date;
    transporterOperatorId?: string;
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
