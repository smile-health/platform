import { WasteSourceAttributes } from '../../infrastructure/database/models/WasteSourceModel';
import { WasteClassificationAttributes } from '../../infrastructure/database/models/WasteClassificationModel';
export default class WasteBagQrCode {
    public id: number | undefined;
    public createdAt?: Date;
    public createdBy?: string;
    public healthcareFacilityId: number;
    public wasteSourceId: number | undefined;
    public wasteClassificationId: number | undefined;
    public qrCode: string;
    public wasteSource: WasteSourceAttributes | undefined;
    public wasteClassification: WasteClassificationAttributes | undefined;
    public scheduledStorageEndDatetime: any | undefined;

    constructor(data: {
        id?: number;
        createdAt?: Date;
        createdBy?: string;
        healthcareFacilityId: number;
        wasteSourceId?: number;
        wasteClassificationId?: number;
        qrCode: string;
        wasteSource?: WasteSourceAttributes;
        wasteClassification?: WasteClassificationAttributes | any;
        scheduledStorageEndDatetime?: any;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.healthcareFacilityId = data.healthcareFacilityId;
        this.wasteSourceId = data.wasteSourceId;
        this.wasteClassificationId = data.wasteClassificationId;
        this.qrCode = data.qrCode;
        this.wasteSource = data.wasteSource;
        this.wasteClassification = data.wasteClassification;
        this.scheduledStorageEndDatetime = data.scheduledStorageEndDatetime;
    }
}
