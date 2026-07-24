export default interface GetWasteBagQrCodeDTO {
    id: number;
    createdAt: Date;
    createdBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    qrCode: string;
}
