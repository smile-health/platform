export default interface GetWasteBagTreatmentRequestDTO {
    id: number;
    createdAt: Date;
    createdBy: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    treatmentGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
}
