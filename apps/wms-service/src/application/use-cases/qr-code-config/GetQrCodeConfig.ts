import QrCodeConfig from '../../../domain/entities/QrCodeConfig';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';

export default class GetQrCodeConfigUseCase {
    constructor(private readonly repository: QrCodeConfigRepository) {}

    async execute(id: string): Promise<QrCodeConfig | null> {
        try {
            const wasteSource = await this.repository.getQrCodeConfigById(id);
            console.log('Fetched qr code config successfully:', wasteSource);
            return wasteSource;
        } catch (error) {
            console.error('Error fetching qr code config:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
