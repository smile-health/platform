import EntityLocation from '../../../domain/entities/EntityLocation';
import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';
import { EntityLocationAttributes } from '../../../infrastructure/database/models/EntityLocationModel';

export default class GetAllEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(
        limit: number,
        page: number,
        search: string | undefined,
        entityId: string,
        tag: string | undefined,
        locationType?: string,
        isSuperAdmin?: boolean,
    ): Promise<
        | EntityLocationAttributes[]
        | {
              data: EntityLocation[];
              pagination: {
                  total: number;
                  pages: number;
                  currentPage: number;
                  perPage: number;
              };
          }
        | null
    > {
        try {
            if (isSuperAdmin) {
                const data = await this.repo.getAllEntityLocationsSuperAdmin(
                    limit,
                    page,
                    locationType ?? 'STORAGE',
                    search,
                    entityId,
                );
                console.log('Data retrieved successfully:', data);
                return data;
            } else {
                if (!tag) return null;

                const currentTag = tag.toLowerCase();
                if (currentTag.includes('hospital')) {
                    const data = await this.repo.getAllEntityLocationsById(entityId);
                    console.log('Data retrieved successfully:', data);
                    return data;
                } else {
                    const data = await this.repo.getAllEntityLocationsTP(
                        limit,
                        page,
                        search,
                        entityId,
                    );
                    console.log('Data retrieved successfully:', data);
                    return data;
                }
            }
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
