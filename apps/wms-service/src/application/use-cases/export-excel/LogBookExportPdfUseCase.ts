import LogBookExportExcelRepository from '../../../domain/repositories/LogBookExportExcelRepository';

export default class LogBookExportPdfUseCase {
    constructor(private readonly repo: LogBookExportExcelRepository) {}

    async execute(startDate: string, endDate: string, healthcareFacilityId: number): Promise<Buffer> {
        try {
            const logBook = await this.repo.getWasteBagLogBookForExportPdf(startDate, endDate, healthcareFacilityId);

            console.log('logBook export retrieved successfully:', logBook);
            return logBook;
        } catch (error) {
            console.error('Error retrieving setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
