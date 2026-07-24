export default interface UpdatePartnerVehicleDTO {
    id: number;
    createdAt: Date;
    createdBy: string;
    updatedAt?: Date;
    updatedBy?: string;
    vehicleType: 'BOX' | 'VAN';
    vehicleNumber: string;
    capacityInKgs: number;
    isApproved: boolean;
    approvedBy?: string;
    approvedOn?: Date;
}
