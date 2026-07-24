export default interface ManualScaleRequestDTO {
    id?: number;
    requestedBy: string;
    processedBy?: string;
    isActive: boolean;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    approvalType: 'TIME_BOUND' | 'COUNT_BASED';
    validUntil?: Date;
    countLimit?: number;
    entityId: number;
    createdAt?: Date;
    updatedAt?: Date;
    user: {
        id: number;
        email: string;
        mobile_phone: string;
        fcm_token: string;
        entity_id: number;
        province_id?: number;
        regency_id?: number;
        name?: string;
    };
    entity: {
        id: number;
        province_id?: number;
        regency_id?: number;
    };
}
