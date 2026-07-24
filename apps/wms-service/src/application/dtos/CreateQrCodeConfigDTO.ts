export default interface CreateQrCodeConfigDTO {
    createdAt: Date;
    createdBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
}
