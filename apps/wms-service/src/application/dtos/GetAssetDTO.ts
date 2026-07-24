export default interface GetAssetDTO {
    id: number;
    createdBy: string;
    updatedBy: string;
    assetType: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
    manufacturerId: number;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
