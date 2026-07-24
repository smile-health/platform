import { UserInfo } from '../../shared/types/userInfo';

export default interface TransportRequestDTO {
    wasteBagQrCodeIds: string[];
    transporterVehicleId?: number;
    // transporterOperatorId: string;
    vehicleNumber?: string;
    consumerId: number;
    providerType: string;
    updatedBy: string;
    startTime: Date;
    endTime: Date;
    treatmentProviderId?: number;
    treatmentOperatorId?: string;
    isReadOnly?: boolean;
    transporterId?: number,
    thirdPartyId?: number,
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
