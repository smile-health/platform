export default interface CreateWasteTransportationGroupDTO {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    createdBy: string;
    totalBagsCount: number;
    totalWeightInKgs: number;
    transporterVehicleId: number | undefined;
    transporterOperatorId: number | undefined;
    handoverLattitude: number | undefined;
    handoverLongitude: number | undefined;
    transportationStatus:
        | 'GENERATED'
        | 'CLASSIFIED'
        | 'SCALED'
        | 'STORED_FOR_TREATMENT'
        | 'STORED_FOR_TRANSPORT'
        | 'TREATED'
        | 'RESIDUE_CLASSIFIED'
        | 'RESIDUE_SCALED'
        | 'RESIDUE_STORED_FOR_TRANSPORT'
        | 'IN_TRANSIT'
        | 'DISPOSED';
}
