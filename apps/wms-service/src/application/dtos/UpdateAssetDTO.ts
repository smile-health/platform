export default interface UpdateAssetDTO {
    id: number;
    updatedAt: string;
    updatedBy: string;
    assetType?: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
    manufacturerId: number;
    name?: string;
    description?: string;
}
