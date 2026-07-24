import WasteBagQrCode from '../../../domain/entities/WasteBagQrCode';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';
import UpdateWasteBagQrCodeDTO from '../../dtos/UpdateWasteBagQrCodeDTO';
import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import WasteClassificationRepository from '../../../domain/repositories/WasteClassificationRepository';
export default class UpdateWasteBagQrCodeUseCase {
    constructor(
        private readonly wasteBagQrCodeRepository: WasteBagQrCodeRepository,
        private readonly wasteSourceRepository: WasteSourceRepository,
        private readonly wasteClassificationRepository: WasteClassificationRepository,
    ) {}

    async execute(data: UpdateWasteBagQrCodeDTO): Promise<WasteBagQrCode | null | string> {
        try {
            const { id, healthcareFacilityId, wasteSourceId, wasteClassificationId, qrCode } = data;

            const existingData = await this.wasteBagQrCodeRepository.getWasteBagQrCodeById(
                id.toString(),
                healthcareFacilityId,
            );

            if (!existingData || typeof existingData === 'string') {
                return null;
            }

            const wasteBagQrCode: WasteBagQrCode = new WasteBagQrCode({
                ...existingData,
                createdAt: new Date(),
                healthcareFacilityId,
                wasteSourceId,
                wasteClassificationId,
                qrCode,
            });

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

            await this.wasteBagQrCodeRepository.updateWasteBagQrCode(wasteBagQrCode);
            console.log('Waste Bag Qr Code updated successfully(execute):', wasteBagQrCode);
            return wasteBagQrCode;
        } catch (error) {
            console.error('Error creating Waste Bag Qr Code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
