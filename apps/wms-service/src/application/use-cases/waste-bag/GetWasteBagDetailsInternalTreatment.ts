import { WasteGroupDetails } from '../../../domain/entities/WasteBagLogBook';
import ReportWasteBagRepository from '../../../domain/repositories/ReportWasteBagRepository';

export default class GetWasteBagDetailsInternalTreatmentUseCase {
    constructor(private readonly repo: ReportWasteBagRepository) {}
    async execute(
        wasteBagQrCodeId: string,
        lang?: string
    ): Promise<{
        data: any;
    }> {
        try {
            const wasteSources = await this.repo.getWasteBagDetailsInternalTreatment(wasteBagQrCodeId, lang);
            console.log('Fetched all transaction waste bag successfully:', wasteSources);
            return wasteSources;
        } catch (error) {
            console.error('Error fetching transaction all waste bag:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
