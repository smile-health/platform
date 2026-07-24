export default interface UpdateWasteTransportationRequestDTO {
    id: number;
    updatedAt?: Date;
    updatedBy: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    transportationGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
}
