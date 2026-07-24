import WasteSourceRepository from '../../../domain/repositories/WasteSourceRepository';
import DeleteWasteSourceDTO from '../../dtos/DeleteWasteSourceDTO';
import WasteBagRepository from '../../../domain/repositories/WasteBagRepository';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';

export default class DeleteWasteSourceUseCase {
    constructor(
        private readonly wasteSourceRepository: WasteSourceRepository,
        private readonly wasteBagRepository: WasteBagRepository,
        private readonly wasteBagQrCode: WasteBagQrCodeRepository,
        private readonly qrCodeConfg: QrCodeConfigRepository,
    ) {}

    async execute(data: DeleteWasteSourceDTO): Promise<boolean | null | string> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste source');
            }

            const existingWasteSource =
                await this.wasteBagRepository.getWasteBagByWasteSourceId(id);

            if (existingWasteSource) {
                return `Waste source with ID ${id} cannot be deleted because it is associated with waste bags.`;
            }

            const existingOnWasteQrCode = await this.wasteBagQrCode.getOneByWasteSourceId(id);

            if (existingOnWasteQrCode) {
                return `Waste source with ID ${id} cannot be deleted because it is associated with waste bags QR code.`;
            }

            const existingOnQrCodeConig = await this.qrCodeConfg.getOneByWasteSourceId(id);

            if (existingOnQrCodeConig) {
                return `Waste source with ID ${id} cannot be deleted because it is associated with QR code config.`;
            }

            return await this.wasteSourceRepository.deleteWasteSource(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste source:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
