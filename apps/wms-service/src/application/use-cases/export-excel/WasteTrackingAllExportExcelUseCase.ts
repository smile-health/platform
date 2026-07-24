import WasteTrackingExportExcelRepository from '../../../domain/repositories/WasteTrackingExportExcelRepository';

export default class WasteTrackingAllExportExcelUseCase {
  constructor(private readonly repo: WasteTrackingExportExcelRepository) {}

  async execute(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    role: string = 'admin',
    type: number = 1,
  ): Promise<Buffer> {
    try {
      const logBook = await this.repo.exportWasteTrackingAllSheetsExcel(
        startDate,
        endDate,
        provinceId,
        regencyId,
        healthcareFacilityId,
        role,
        type,
      );

      console.log('exportWasteTrackingAllSheetsExcel export retrieved successfully:', logBook);
      return logBook;
    } catch (error) {
      console.error('Error retrieving setting:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
