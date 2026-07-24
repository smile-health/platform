export default interface CreateWasteDTO {
    createdAt: Date;
    createdBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    sourceTreatmentGroupId: string;
    scaleMethod: 'MANUAL' | 'IOT';
    weightInKgs: number | undefined;
    wasteBagQrCodeId: string;
    assetId: number;
    binNumber: string | undefined;
    wasteGroupIds?: string;
    bastNo?: string;
    materialIds?: string;
    iotMethod: 'BLUETOOTH' | 'INTERNET' | undefined;
    isTreated?: boolean;
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
