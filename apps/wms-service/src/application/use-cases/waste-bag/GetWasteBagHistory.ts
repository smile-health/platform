import { WasteBagHistory } from '../../../domain/entities/WasteBagTrackingHistory';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';
export default class GetWasteBagHistoryUseCase {
    constructor(private readonly repo: ReportWasteBagRepository) {}

    async execute(
        wasteBagId?: number,
        wasteBagQrCode?: string,
        wasteGroupNumber?: string,
    ): Promise<WasteBagHistory[]> {
        try {
            const data = await this.repo.getWasteBagHistory(
                wasteBagId,
                wasteBagQrCode,
                wasteGroupNumber,
            );
            console.log('Fetched all waste bag history successfully:', data);
            return data;
        } catch (error) {
            console.error('Error fetching all waste bag history:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
