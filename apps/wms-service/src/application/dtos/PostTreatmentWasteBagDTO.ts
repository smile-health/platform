export default interface PostTreatmentWasteBagDTO {
    schema: 'DISINFECTION' | 'PYROLYSIS' | 'LANDFILLED' | 'RECYCLED' | 'DISPOSED';
    wasteBagQrCodeIds: string[];
    createdBy: string;
    token: string;
    healthcareFacilityId: number;
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
