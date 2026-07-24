export default interface CreateWasteTransportationGroupDTO {
    createdAt: Date;
    createdBy: string;
    totalBagsCount: number;
    totalWeightInKgs: number;
    transporterVehicleId?: number;
    transporterOperatorId?: string;
    handoverLattitude?: number;
    handoverLongitude?: number;
    transportationStatus: 'READY_FOR_TRANSPORT' | 'TRANSPORTATION_REQUEST_CREATED';
    handoverTimestamp?: Date;
}
