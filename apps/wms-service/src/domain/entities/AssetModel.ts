import { AsetManufacturerAttributes } from '../../infrastructure/database/models/AssetManufacturerModel';
export default class AssetModel {
    public id: number | undefined;
    public createdBy: string;
    public updatedBy: string;
    public assetType: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
    public manufacturerId: number;
    public name: string;
    public description: string | undefined;
    public createdAt: Date | undefined;
    public updatedAt: Date | undefined;
    public manufacturer: AsetManufacturerAttributes | undefined;

    constructor(asset: {
        id?: number;
        createdBy: string;
        updatedBy: string;
        assetType: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
        manufacturerId: number;
        name: string;
        description?: string;
        createdAt?: Date;
        updatedAt?: Date;
        manufacturer?: AsetManufacturerAttributes;
    }) {
        this.id = asset.id ?? undefined;
        this.createdBy = asset.createdBy;
        this.updatedBy = asset.updatedBy;
        this.assetType = asset.assetType;
        this.manufacturerId = asset.manufacturerId;
        this.name = asset.name;
        this.description = asset.description ?? undefined;
        this.createdAt = asset.createdAt;
        this.updatedAt = asset.updatedAt;
        this.manufacturer = asset.manufacturer ?? undefined;
    }
}
