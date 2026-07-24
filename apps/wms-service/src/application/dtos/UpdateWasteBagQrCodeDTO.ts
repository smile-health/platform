export default interface UpdateWasteBagQrCodeDTO {
    id: number;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    qrCode: string;
}
