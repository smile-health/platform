export default interface GetAssetManufacturerDTO {
    id: number;
    updatedBy: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    description?: string;
}
