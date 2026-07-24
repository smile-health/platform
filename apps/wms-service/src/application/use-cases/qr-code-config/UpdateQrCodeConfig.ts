import QrCodeConfig from '../../../domain/entities/QrCodeConfig';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';
import UpdateQrCodeConfigDTO from '../../dtos/UpdateQrCodeConfigDTO';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';

export default class UpdateQrCodeConfigUseCase {
    constructor(
        private readonly qrCodeConfigRepository: QrCodeConfigRepository,
        private readonly wasteSourceRepository: WasteSourceRepository,
        private readonly wasteClassificationRepository: WasteClassificationRepository,
    ) {}

    async execute(data: UpdateQrCodeConfigDTO): Promise<QrCodeConfig | null | string> {
        try {
            const {
                id,
                updatedBy,
                healthcareFacilityId,
                wasteSourceId,
                wasteClassificationId,
                labelCount,
            } = data;

            const existingDataRelational = await this.wasteSourceRepository.getWasteSourceById(
                wasteSourceId.toString(),
            );

            if (!existingDataRelational) {
                return `Qr Code Config with ID ${wasteSourceId} not found`;
            }

            const existingDataWasteClassification =
                await this.wasteClassificationRepository.getWasteClassificationById(
                    wasteClassificationId,
                );

            if (!existingDataWasteClassification) {
                return `Waste Classification with ID ${wasteClassificationId} not found`;
            }

            const existingData = await this.qrCodeConfigRepository.getQrCodeConfigById(
                id.toString(),
            );

            if (!existingData) {
                return null;
            }

            const qrCodeConfig: QrCodeConfig = new QrCodeConfig({
                ...existingData,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: updatedBy,
                updatedBy,
                healthcareFacilityId,
                wasteSourceId,
                wasteClassificationId,
                labelCount,
            });

            await this.qrCodeConfigRepository.updateQrCodeConfig(qrCodeConfig);
            console.log('Qr Code Config updated successfully(execute):', qrCodeConfig);
            return qrCodeConfig;
        } catch (error) {
            console.error('Error creating Qr Code Config:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
