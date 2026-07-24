import WasteTrackingExportExcelRepository from '../../../domain/repositories/WasteTrackingExportExcelRepository';

export default class WasteCharacteristicsSummaryExportExcelUseCase {
  constructor(private readonly repo: WasteTrackingExportExcelRepository) {}

  async execute(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer> {
    try {
      const logBook = await this.repo.getWasteCharacteristicsSummaryForExport(
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
