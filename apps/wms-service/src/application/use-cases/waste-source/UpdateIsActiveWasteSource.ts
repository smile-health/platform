import WasteSource from '../../../domain/entities/WasteSource';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';

export default class UpdateIsActiveWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: WasteSourceRepository) {}

    async execute(id: number, isActive: boolean): Promise<WasteSource | null> {
        try {
            if (!id) {
                throw new Error('ID is required to update an waste source');
            }

            const existingData = await this.wasteSourceRepository.getWasteSourceById(id.toString());

            if (!existingData) {
                return null;
            }

            const wasteSource: WasteSource = new WasteSource({
                ...existingData,
                isActive: isActive,
                updatedAt: new Date(),
            });

            await this.wasteSourceRepository.updateWasteSource(wasteSource);
            console.log('Waste source updated successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error updating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
