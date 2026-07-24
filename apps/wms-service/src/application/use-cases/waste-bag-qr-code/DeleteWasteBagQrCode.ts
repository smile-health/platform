import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';
import DeleteWasteBagQrCodeDTO from '../../dtos/DeleteWasteBagQrCodeDTO';

export default class DeleteWasteBagQrCodeUseCase {
    constructor(private readonly wasteBagQrCodeRepository: WasteBagQrCodeRepository) {}

    async execute(data: DeleteWasteBagQrCodeDTO): Promise<boolean | string> {
        try {
            const { id } = data;

            if (!id) {
                throw new Error('ID is required to delete a waste bag qr code');
            }

            return await this.wasteBagQrCodeRepository.deleteWasteBagQrCode(id.toString(), data.deletedBy);
        } catch (error) {
            console.error('Error deleting waste bag qr code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
