import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';
import DeleteQrCodeConfigDTO from '../../dtos/DeleteQrCodeConfigDTO';

export default class DeleteQrCodeConfigUseCase {
    constructor(private readonly wasteSourceRepository: QrCodeConfigRepository) {}

    async execute(data: DeleteQrCodeConfigDTO): Promise<boolean | null> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a qr code config');
            }

            return await this.wasteSourceRepository.deleteQrCodeConfig(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting qr code config:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
