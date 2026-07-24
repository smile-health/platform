import { EntityLocationAttributes } from '../../infrastructure/database/models/EntityLocationModel';
import EntityLocation from '../entities/EntityLocation';

export default interface EntityLocationRepository {
    createEntityLocationHF(payload: EntityLocation): Promise<void | string>;
    createEntityLocationTP(payload: EntityLocation): Promise<void | string>;
    getEntityLocationById(id: number, token: string): Promise<EntityLocation | null>;
    getAllEntityLocationsById(entityId: string): Promise<EntityLocationAttributes[] | null>;
    getAllEntityLocationsPartnership(
        entityId: string,
        healtcareFacilityId?: number,
        wasteClassificationId?: number,
    ): Promise<EntityLocationAttributes[] | null>;
    getAllEntityLocationsTP(
        limit: number,
        page: number,
        search: string | undefined,
        entityId: string | undefined,
    ): Promise<{
        data: EntityLocation[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    getAllEntityLocationsSuperAdmin(
        limit: number,
        page: number,
        locationType: string,
        search?: string,
        entityId?: string,
    ): Promise<{
        data: EntityLocation[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
    validateDistanceLimit(
        id: number,
        longitude: number,
        latitude: number,
    ): Promise<{ result: boolean; distance: number } | null>;
    updateEntityLocation(payload: EntityLocation): Promise<void | null>;
    deleteEntityLocation(id: string, deletedBy?: number): Promise<boolean | null>;
}
