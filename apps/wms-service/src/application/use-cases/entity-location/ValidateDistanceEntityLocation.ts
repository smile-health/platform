import EntityLocationRepository from '../../../domain/repositories/EntityLocationRepository';

export default class ValidateDistanceEntityLocationUseCase {
    constructor(private readonly repo: EntityLocationRepository) {}

    async execute(
        id: number,
        longitude: number,
        latitude: number,
    ): Promise<{ result: boolean; distance: number } | null> {
        try {
            const data = await this.repo.validateDistanceLimit(id, longitude, latitude);

            return data;
        } catch (error) {
            console.error('Error retrieving Setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
