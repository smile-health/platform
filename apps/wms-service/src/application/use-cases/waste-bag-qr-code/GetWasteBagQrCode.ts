import WasteBagQrCode from '../../../domain/entities/WasteBagQrCode';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';

export default class GetWasteBagQrCodeUseCase {
    constructor(private readonly repository: WasteBagQrCodeRepository) {}

    async execute(id: string, entityId: number): Promise<WasteBagQrCode | null | string> {
        try {
            const wasteSource = await this.repository.getWasteBagQrCodeById(id, entityId);
            console.log('Fetched waste bag qr code successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching waste bag qr code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
