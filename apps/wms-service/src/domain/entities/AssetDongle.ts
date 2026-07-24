import { AsetManufacturerAttributes } from '../../infrastructure/database/models/AssetManufacturerModel';
export default class AssetDongle {
    public assetId: string | undefined;
    public createdAt: Date | undefined;
    public updatedAt: Date | undefined;

    constructor(asset: {
        assetId?: string;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        this.assetId = asset.assetId ?? undefined;
        this.createdAt = asset.createdAt;
        this.updatedAt = asset.updatedAt;
    }
}
