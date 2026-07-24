export default interface UpdateWasteSourceDTO {
    id: number;
    updatedAt: Date;
    updatedBy: string;
    parentHierarchyId: number;
    name: string;
    nameEn: string;
    description?: string;
    descriptionEn?: string;
    level?: number;
    isResidue: boolean;
    isActive: boolean;
}
