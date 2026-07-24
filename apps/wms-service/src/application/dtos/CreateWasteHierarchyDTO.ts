export default interface CreateQrCodeConfigDTO {
    createdAt: Date;
    createdBy: string;
    regionId: number;
    parentHierarchyId?: number;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    level: number;
    isResidue: boolean;
}
