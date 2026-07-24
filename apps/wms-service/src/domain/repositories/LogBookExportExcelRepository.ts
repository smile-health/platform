export default interface LogBookExportExcelRepository {
    getWasteBagLogBookForExportExcel(
        startDate: string,
        endDate: string,
        healthcareFacilityId: number,
        provinceId?: number,
        regencyId?: number,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
    ): Promise<Buffer>;
    getWasteBagLogBookForExportPdf(
        startDate: string,
        endDate: string,
        healthcareFacilityId: number,
    ): Promise<Buffer>;
}
