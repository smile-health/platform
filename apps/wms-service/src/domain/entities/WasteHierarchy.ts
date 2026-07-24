import { WasteClassificationAttributesId } from '../../infrastructure/database/models/WasteClassificationModel';
import { WasteHierarchyAttributes } from '../../infrastructure/database/models/WasteHierarchyModel';

export default class WasteHierarchy {
    public id: number | undefined;
    public createdBy: string;
    public updatedBy?: string;
    public parentHierarchyId: number | null;
    public regionId: number;
    public name: string;
    public nameEn: string;
    public description: string | undefined;
    public descriptionEn: string | undefined;
    public createdAt: Date;
    public updatedAt?: Date | undefined;
    public level?: number;
    public isResidue?: boolean;
    public isActive?: boolean;
    public wasteType: WasteHierarchyAttributes | undefined;
    public wasteGroup: WasteHierarchyAttributes | undefined;
    public wasteClassification?: WasteClassificationAttributesId | undefined;
    public userName?: string;

    constructor(wasteHierarchy: {
        id?: number;
        createdBy: string;
        updatedBy?: string;
        parentHierarchyId?: number;
        regionId: number;
        name: string;
        nameEn: string;
        description?: string;
        descriptionEn?: string;
        createdAt: Date;
        updatedAt?: Date;
        level?: number;
        isResidue?: boolean;
        isActive?: boolean;
        wasteType?: WasteHierarchyAttributes;
        wasteGroup?: WasteHierarchyAttributes;
        wasteClassification?: WasteClassificationAttributesId;
        userName?: string;
    }) {
        this.id = wasteHierarchy.id ?? undefined;
        this.createdBy = wasteHierarchy.createdBy;
        this.updatedBy = wasteHierarchy.updatedBy;
        this.parentHierarchyId = wasteHierarchy.parentHierarchyId ?? null;
        this.name = wasteHierarchy.name;
        this.nameEn = wasteHierarchy.nameEn;
        this.regionId = wasteHierarchy.regionId;
        this.description = wasteHierarchy.description ?? undefined;
        this.descriptionEn = wasteHierarchy.descriptionEn ?? undefined;
        this.createdAt = wasteHierarchy.createdAt;
        this.updatedAt = wasteHierarchy.updatedAt;
        this.level = wasteHierarchy.level ?? 0;
        this.wasteType = wasteHierarchy.wasteType;
        this.wasteGroup = wasteHierarchy.wasteGroup;
        this.isResidue = wasteHierarchy.isResidue;
        this.isActive = wasteHierarchy.isActive;
        this.wasteClassification = wasteHierarchy.wasteClassification;
        this.userName = wasteHierarchy.userName;
    }
}
