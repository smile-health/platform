export default class EntityLocation {
    public id: number | undefined;
    public createdAt: Date;
    public createdBy: string;
    public updatedAt: Date | undefined;
    public updatedBy: string | undefined;
    public entityId: number;
    public locationName: string;
    public latitude: number;
    public longitude: number;
    public distanceLimitInMeters?: number;
    public address?: string;
    public provinceId?: number;
    public cityId?: number;
    public provinceName?: string;
    public cityName?: string;
    public locationType?: 'STORAGE' | 'TREATMENT';
    public entityName?: string;

    constructor(data: {
        id?: number;
        createdBy: string;
        updatedBy: string;
        createdAt: Date;
        updatedAt: Date;
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
        locationType?: 'STORAGE' | 'TREATMENT';
        entityName?: string;
    }) {
        this.id = data.id;
        this.createdAt = data.createdAt;
        this.createdBy = data.createdBy;
        this.updatedAt = data.updatedAt;
        this.updatedBy = data.updatedBy;
        this.entityId = data.entityId;
        this.locationName = data.locationName;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.distanceLimitInMeters = data.distanceLimitInMeters;
        this.address = data.address;
        this.provinceId = data.provinceId;
        this.cityId = data.cityId;
        this.provinceName = data.provinceName;
        this.cityName = data.cityName;
        this.locationType = data.locationType;
        this.entityName = data.entityName;
    }
}
