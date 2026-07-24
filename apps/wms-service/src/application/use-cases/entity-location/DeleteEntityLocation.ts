import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';

export default class DeleteEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(id: string, deletedBy?: number): Promise<boolean | null> {
        try {
            if (!id) {
                throw new Error('ID is required to delete an entity location');
            }

            return await this.repo.deleteEntityLocation(id, deletedBy);
        } catch (error) {
            console.error('Error deleting entity location:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
