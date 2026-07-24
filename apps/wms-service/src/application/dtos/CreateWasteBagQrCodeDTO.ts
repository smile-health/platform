export default interface CreateWasteBagQrCodeDTO {
    createdAt: Date;
    createdBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
    // qrCode: string;
}
