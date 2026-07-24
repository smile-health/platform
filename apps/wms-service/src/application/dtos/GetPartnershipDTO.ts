export default interface GetPartnershipDTO {
    healthcareFacilityId: number;
    partnerId: number;
    contractStartDate: Date;
    contractEndDate: Date;
    contractId: string;
    partnershipStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'EXPIRED';
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
    canLandfill: boolean;
    canRecycle: boolean;
    canInsinerator: boolean;
    hasAutoclave: boolean;
    landfilllingProvider?: 'SELF' | 'THIRD_PARTY';
    recyclingProvider?: 'SELF' | 'THIRD_PARTY';
    incinerationProvider?: 'SELF' | 'THIRD_PARTY';
    steriliseProvider?: 'SELF' | 'THIRD_PARTY';
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
}
