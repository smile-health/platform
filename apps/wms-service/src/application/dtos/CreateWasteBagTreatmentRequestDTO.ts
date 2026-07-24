export default interface CreateWasteBagTreatmentRequestDTO {
    createdAt: Date;
    createdBy: string;
    requestStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    treatmentGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
}
