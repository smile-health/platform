export default interface IncinerateWasteBagDTO {
    wasteBagQrCodeIds: string[];
    createdBy: string;
    treatmentStartTime: Date;
    treatmentEndTime: Date;
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
