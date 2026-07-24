export default interface UpdateWasteBagTreatmentRequestDTO {
    id: number;
    updatedAt: Date;
    updatedBy: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    treatmentGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
}
