interface ExpressFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}

export default interface TreatmentHandoverDTO {
    wasteBagQrCodeId: string;
    entityId: number;
    updatedBy: string;
    startTime?: Date;
    endTime?: Date;
}
export interface TreatmentReceivmentDTO {
    wasteBagQrCodeIds: string[];
    entityId: number;
    token: string;
    updatedBy: string;
    startTime?: Date;
    endTime?: Date;
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
