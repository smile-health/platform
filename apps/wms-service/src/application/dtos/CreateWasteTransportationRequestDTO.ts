export default interface CreateWasteTransportationRequestDTO {
    // id?: number;
    createdAt: Date;
    createdBy: string;
    // updatedAt?: Date;
    // updatedBy?: string;
    requestStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    transportationGroupId: number;
    requestCreatorId?: number;
    requestApproverId?: number;
}
