import EntityLocation from '../../../domain/entities/EntityLocation';
import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';
import { EntityLocationAttributes } from '../../../infrastructure/database/models/EntityLocationModel';

export default class GetAllEntityLocationByEntityUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(
        entityId: string,
        healtcareFacilityId?: number,
        wasteClassificationId?: number,
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
            const data = await this.repo.getAllEntityLocationsPartnership(
                entityId,
                healtcareFacilityId,
                wasteClassificationId,
            );

            return data;
        } catch (error) {
            console.error('Error retrieving data entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
