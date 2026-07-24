export default interface WasteTrackingExportExcelRepository {
  getWasteCharacteristicsSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;

  getWasteRecordCharacteristicsSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;

  getWasteSourceSummaryForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;

  getWasteBagExportForExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    search?: string,
    wasteTypeId?: number,
    wasteGroupId?: number,
    wasteCharacteristicsId?: number,
  ): Promise<Buffer>;

  getWasteGroupExportForExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;

  getWasteExternalForExport(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
  ): Promise<Buffer>;

  exportWasteTrackingAllSheetsExcel(
    startDate: string,
    endDate: string,
    provinceId?: number,
    regencyId?: number,
    healthcareFacilityId?: number,
    role?: string,
    type?: number,
  ): Promise<Buffer>;
}
