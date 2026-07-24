import Region from '../entities/Region';

export default interface RegionRepository {
    getRegionById(id: string): Promise<Region | null>;
    getOneRegion(): Promise<Region | null>;
    getValidationDistanceLimit(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        type: string,
        entityId: number,
    ): Promise<boolean>;
}
