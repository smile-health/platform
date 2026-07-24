import WasteSource from '../../../domain/entities/WasteSource';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';

export default class GetWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: WasteSourceRepository) {}

    async execute(id: string): Promise<WasteSource | null> {
        try {
            const wasteSource = await this.wasteSourceRepository.getWasteSourceById(id);
            console.log('Fetched waste source successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
