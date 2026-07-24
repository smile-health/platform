import Entities from '../entities/Entities';

export default interface EntitiesRepository {
    getEntityId(id: number): Promise<Entities | null>;
    updateEntity(entityId: number, payload: Entities): Promise<Entities | null>;
    updateStatusActiveEntities(entityId: number, isActive: boolean): Promise<Entities | null>;
    getAllEntities(
        limit?: number,
        page?: number,
        entityTypeId?: number,
        entityId?: number,
        groupBy?: string[],
        attributes?: string[],
        search?: string,
        provinceId?: number,
        regencyId?: number,
        isActive?: boolean,
    ): Promise<{
        data: Entities[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;
}
