export default interface CreateQrCodeConfigDTO {
    id: number;
    updatedAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedBy: string;
    healthcareFacilityId: number;
    wasteSourceId: number;
    wasteClassificationId: number;
    labelCount: number;
}
