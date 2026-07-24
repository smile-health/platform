import Entities from '../../../domain/entities/Entities';
import EntitiesRepository from '../../../domain/repositories/EntitiesRepository';

export default class GetAllEntitiesUseCase {
    constructor(private readonly repo: EntitiesRepository) {}

    async execute(
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
    }> {
        try {
            const result = await this.repo.getAllEntities(
                limit,
                page,
                entityTypeId,
                entityId,
                groupBy,
                attributes,
                search,
                provinceId,
                regencyId,
                isActive,
            );
            return result;
        } catch (error) {
            console.error('Error in GetAllEntitiesUseCase:', error);
            throw new Error('Failed to fetch entities');
        }
    }
}
