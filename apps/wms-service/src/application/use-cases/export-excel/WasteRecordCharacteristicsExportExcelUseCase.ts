import WasteTrackingExportExcelRepository from '../../../domain/repositories/WasteTrackingExportExcelRepository';

export default class WasteRecordCharacteristicsSummaryExportExcelUseCase {
    constructor(private readonly repo: WasteTrackingExportExcelRepository) {}

    async execute(
        startDate: string,
        endDate: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
    ): Promise<Buffer> {
        try {
            const logBook = await this.repo.getWasteRecordCharacteristicsSummaryForExport(
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
            );

            return logBook;
        } catch (error) {
            console.error('Error retrieving setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
