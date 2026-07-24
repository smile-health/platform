import WasteBagQrCode from '../../../domain/entities/WasteBagQrCode';
import WasteBagQrCodeRepository from '../../../domain/repositories/WasteBagQrCodeRepository';

export default class GetAllWasteBagQrCodeUseCase {
    constructor(private readonly repository: WasteBagQrCodeRepository) {}

    async execute(
        limit: number,
        page: number,
        entity_id: string | number | undefined,
        search?: string,
    ): Promise<{
        data: WasteBagQrCode[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repository.getAllWasteBagQrCodes(
                limit,
                page,
                entity_id,
                search,
            );
            console.log('Fetched all waste bag qr code successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all waste bag qr code:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
