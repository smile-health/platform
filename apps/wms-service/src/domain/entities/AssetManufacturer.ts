import { AsetModelAttributes } from '../../infrastructure/database/models/AssetModel';
export default class AssetManufacturer {
    public id: number | undefined;
    public createdBy: string;
    public updatedBy: string;
    public name: string;
    public description: string | undefined;
    public createdAt: Date;
    public updatedAt: Date;
    public assetModels: AsetModelAttributes[] | undefined;

    constructor(asset: {
        id?: number;
        createdBy: string;
        updatedBy: string;
        name: string;
        description?: string;
        createdAt: Date;
        updatedAt: Date;
        assetModels?: AsetModelAttributes[];
    }) {
        this.id = asset.id ?? undefined;
        this.createdBy = asset.createdBy;
        this.updatedBy = asset.updatedBy;
        this.name = asset.name;
        this.description = asset.description ?? undefined;
        this.createdAt = asset.createdAt;
        this.updatedAt = asset.updatedAt;
        this.assetModels = asset.assetModels;
    }
}
