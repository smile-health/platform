import QrCodeConfig from '../../../domain/entities/QrCodeConfig';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';
import CreateQrCodeConfigDTO from '../../dtos/CreateQrCodeConfigDTO';
import { checkExistingData } from '../../../shared/utils/checkExistingData';
import WasteClassificationModel from '../../../infrastructure/database/models/WasteClassificationModel';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';

export default class CreateQrCodeConfigUseCase {
    constructor(
        private readonly qrCodeConfigRepository: QrCodeConfigRepository,
        private readonly wasteSourceRepository: WasteSourceRepository,
    ) {}

    async execute(data: CreateQrCodeConfigDTO): Promise<QrCodeConfig | string> {
        try {
            const {
                createdBy,
                healthcareFacilityId,
                wasteSourceId,
                wasteClassificationId,
                labelCount,
            } = data;
            const qrCodeConfig: QrCodeConfig = new QrCodeConfig({
                createdAt: new Date(),
                createdBy,
                healthcareFacilityId,
                wasteSourceId,
                wasteClassificationId,
                labelCount,
            });

            const existingData = await this.wasteSourceRepository.getWasteSourceById(
                wasteSourceId.toString(),
            );

            if (!existingData) {
                return `Waste Source with ID ${wasteSourceId} not found`;
            }

            const existingDataWasteClassification = (await checkExistingData(
                WasteClassificationModel,
                wasteClassificationId,
            )) as any;

            if (!existingDataWasteClassification) {
                return `Waste Classification with ID ${wasteClassificationId} not found`;
            }

            await this.qrCodeConfigRepository.createQrCodeConfig(qrCodeConfig);
            console.log('Qr Code Config created successfully(execute):', qrCodeConfig);
            return qrCodeConfig;
        } catch (error) {
            console.error('Error creating Qr Code Config:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
