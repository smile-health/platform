import Region from '../../../domain/entities/Region';
import RegionRepository from '../../../domain/repositories/RegionRepository';

export default class GetRegionUseCase {
    constructor(private readonly repository: RegionRepository) {}

    async execute(id: string): Promise<Region | null> {
        try {
            const wasteSource = await this.repository.getRegionById(id);
            console.log('Fetched regional successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching regional:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
