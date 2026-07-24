import RegionRepository from '../../../domain/repositories/RegionRepository';

export default class GetValidationDistanceLimit {
    constructor(private readonly repository: RegionRepository) {}

    async execute(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
        type: string,
        entityId: number,
    ): Promise<boolean> {
        try {
            const data = await this.repository.getValidationDistanceLimit(
                lat1,
                lon1,
                lat2,
                lon2,
                type,
                entityId,
            );

            return data;
        } catch (error) {
            console.error('Error fetching regional:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
