import QrCodeConfig from '../../../domain/entities/QrCodeConfig';
import QrCodeConfigRepository from '../../../domain/repositories/QrCodeConfigRepository';

export default class GetAllQrCodeConfigUseCase {
    constructor(private readonly repository: QrCodeConfigRepository) {}

    async execute(
        limit: number,
        page: number,
        token: string,
        lang: string,
        entity_id: string | number | undefined,
        search?: string,
        sourceType?: string,
        validSortBy?: string,
        validSortOrder?: string,
    ): Promise<{
        data: QrCodeConfig[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const wasteSources = await this.repository.getAllQrCodeConfigs(
                limit,
                page,
                token,
                lang,
                entity_id,
                search,
                sourceType,
                validSortBy,
                validSortOrder,
            );
            console.log('Fetched all qr code config successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching all qr code config:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
