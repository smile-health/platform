import WasteSource from '../../../domain/entities/WasteSource';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import CreateWasteSourceDTO from '../../dtos/CreateWasteSourceDTO';

export default class CreateWasteSourceUseCase {
    constructor(private readonly wasteSourceRepository: WasteSourceRepository) {}

    async execute(data: CreateWasteSourceDTO): Promise<WasteSource | null> {
        try {
            const {
                createdBy,
                healthcareFacilityId,
                sourceType,
                internalSourceName,
                internalTreatmentName,
                externalHealthcareFacilityId,
                externalHealthcareFacilityName,
                isActive,
                isResidue,
            } = data;

            const wasteSource: WasteSource = new WasteSource({
                createdAt: new Date(),
                createdBy,
                healthcareFacilityId,
                sourceType,
                internalSourceName,
                internalTreatmentName,
                externalHealthcareFacilityId,
                externalHealthcareFacilityName,
                isActive,
                isResidue,
            });

            if (sourceType === 'INTERNAL_TREATMENT') {
                const validation = await this.wasteSourceRepository.checkDuplication(wasteSource);

                if (!validation) {
                    return null;
                }
                await this.wasteSourceRepository.createWasteSource(wasteSource);
                console.log('Waste source created successfully(execute):', wasteSource);
                return wasteSource;
            } else {
                await this.wasteSourceRepository.createWasteSource(wasteSource);
                console.log('Waste source created successfully(execute):', wasteSource);
                return wasteSource;
            }
        } catch (error) {
            console.error('Error creating waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
