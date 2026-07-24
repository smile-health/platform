export default interface CreateAssetDTO {
    createdBy: string;
    createdAt: Date;
    assetType: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
    manufacturerId: number;
    name: string;
    description?: string;
}
