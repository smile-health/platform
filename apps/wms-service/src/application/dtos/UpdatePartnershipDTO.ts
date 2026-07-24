export default interface UpdatePartnershipDTO {
    id: number;
    updatedBy?: string;
    updatedAt?: Date;
    contractId?: string;
    contractStartDate?: Date;
    contractEndDate?: Date;
    consumerId: number;
    consumerType:
        | 'HEALTHCARE_FACILITY'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER';
    wasteClassificationId: number;
    providerId: number;
    providerType:
        | 'LANDFILLER'
        | 'TREATMENT_PROVIDER'
        | 'RECYCLER'
        | 'TREATMENT'
        | 'SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER'
        | 'TRANSPORTER_RECYCLER'
        | 'TRANSPORTER_SPECIALIZED_TREATMENT_PROVIDER'
        | 'TRANSPORTER_LANDFILL'
        | 'TRANSPORTER_TREATMENT'
        | 'TRANSPORTER_TREATMENT_PROVIDER'
        | 'TRANSPORTER_GOVERNMENT'
        | 'TRANSPORTER_GOVERNMENT_WASTE_BANK';
    partnershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
    hasIncinerator: boolean;
    hasAutoclave: boolean;
    token: string;
    picName?: string;
    picPosition?: string;
    picPhoneNumber?: string;
    pricePerKg?: number;
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
