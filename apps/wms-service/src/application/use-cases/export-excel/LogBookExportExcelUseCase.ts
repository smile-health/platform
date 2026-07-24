import LogBookExportExcelRepository from '../../../domain/repositories/LogBookExportExcelRepository';

export default class LogBookExportExcelUseCase {
  constructor(private readonly repo: LogBookExportExcelRepository) {}

  async execute(
    startDate: string,
    endDate: string,
    healthcareFacilityId: number,
    provinceId?: number,
    regencyId?: number,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Buffer> {
    try {
      const logBook = await this.repo.getWasteBagLogBookForExportExcel(
        startDate,
        endDate,
        healthcareFacilityId,
        provinceId,
        regencyId,
        wasteTypeId,
        wasteGroupId,
        wasteCharacteristicsId,
      );

      return logBook;
    } catch (error) {
      console.error('Error retrieving setting:', error);
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
}
