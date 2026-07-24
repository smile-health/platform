import Entities from '../../../domain/entities/Entities';
import EntitiesRepository from '../../../domain/repositories/EntitiesRepository';
import EntitiesDTO from '../../dtos/EntitiesDTO';

export default class UpdateStatusActiveEntitiesUseCase {
    constructor(private readonly repo: EntitiesRepository) {}

    async execute(entityId: number, isActive:boolean): Promise<Entities | any> {
        try {
            if (!entityId) {
                return 'ID is required to update an entity setting';
            }

            const existingData = await this.repo.getEntityId(entityId);

            if (!existingData) {
                return `Entities with ID ${entityId} not found`;
            }

            const dataEntities = await this.repo.updateStatusActiveEntities(entityId, isActive);
            console.log('Entity location created successfully:', dataEntities);
            return dataEntities;
        } catch (error) {
            console.error('Error creating Entity Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
