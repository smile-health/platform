import Entities from "../../../domain/entities/Entities";
import EntitiesRepository from "../../../domain/repositories/EntitiesRepository";

export default class GetEntitiesByIdUseCase {
    constructor(private readonly repo: EntitiesRepository) {}

    async execute(entityId: number): Promise<Entities | null> {
        try {
            const data = await this.repo.getEntityId(entityId);
            if (!data) {
                console.error(`Entities with ID ${entityId} not found`);
                return null;
            }
            console.log('Entities retrieved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error retrieving Entities:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}