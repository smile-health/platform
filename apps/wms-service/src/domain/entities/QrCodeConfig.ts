import { WasteSourceAttributes } from '../../infrastructure/database/models/WasteSourceModel';
import { WasteClassificationAttributes } from '../../infrastructure/database/models/WasteClassificationModel';
export default class QrCodeConfig {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public healthcareFacilityId: number;
    public wasteSourceId: number;
    public wasteClassificationId: number;
    public labelCount: number;
    public wasteSource: WasteSourceAttributes | undefined;
    public wasteClassification: WasteClassificationAttributes | undefined;
    public userName?: string;

    constructor(data: {
        id?: number;
        createdAt: Date;
        createdBy: string;
        updatedAt?: Date;
        updatedBy?: string;
        healthcareFacilityId: number;
        wasteSourceId: number;
        wasteClassificationId: number;
        labelCount: number;
        wasteSource?: WasteSourceAttributes;
        wasteClassification?: WasteClassificationAttributes | any;
        userName?: string;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.healthcareFacilityId = data.healthcareFacilityId;
        this.wasteSourceId = data.wasteSourceId;
        this.wasteClassificationId = data.wasteClassificationId;
        this.labelCount = data.labelCount;
        this.wasteSource = data.wasteSource;
        this.wasteClassification = data.wasteClassification;
        this.userName = data.userName;
    }
}
