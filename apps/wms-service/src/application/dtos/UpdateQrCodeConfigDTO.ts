export default interface CreateQrCodeConfigDTO {
    id: number;
    updatedAt: Date;
    updatedBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
}
