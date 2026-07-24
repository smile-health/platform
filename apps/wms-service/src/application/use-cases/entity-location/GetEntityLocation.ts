import EntityLocation from '../../../domain/entities/EntityLocation';
import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';

export default class GetEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(id: string, token: string): Promise<EntityLocation | null> {
        try {
            const data = await this.repo.getEntityLocationById(Number(id), token);
            if (!data) {
                console.error(`Setting with ID ${id} not found`);
                return null;
            }
            console.log('Setting retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
