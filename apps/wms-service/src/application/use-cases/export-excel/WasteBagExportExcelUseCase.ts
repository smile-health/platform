import WasteTrackingExportExcelRepository from '../../../domain/repositories/WasteTrackingExportExcelRepository';

export default class WasteBagExportExcelUseCase {
    constructor(private readonly repo: WasteTrackingExportExcelRepository) {}

    async execute(
        startDate: string,
        endDate: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        search?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
    ): Promise<Buffer> {
        try {
            const logBook = await this.repo.getWasteBagExportForExcel(
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
                search,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
            );

            console.log(
                'getWasteBagExportForExcel export retrieved successfully:',
                logBook,
            );
            return logBook;
        } catch (error) {
            console.error('Error retrieving setting:', error);
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
