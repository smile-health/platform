export default interface EntityLocationDTO {
    id?: number;
    createdBy: string;
    updatedBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    entityId: number;
    locationName: string;
    latitude: number;
    longitude: number;
    distanceLimitInMeters?: number;
    address?: string;
    provinceId?: number;
    cityId?: number;
    provinceName?: string;
    cityName?: string;
    entityTag?: string;
    locationType?: 'STORAGE' | 'TREATMENT';
}
