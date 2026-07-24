export default interface WasteBagMonitoringDashboardRepository {
    getWasteGroupSummaryChart(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        lang?: string,
    ): Promise<{
        total: number;
        data: Array<{
            labelType: string,
            label: string;
            value: number;
        }>;
    }>;

    getWasteCharacteristicsSummaryChart(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        lang?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    >;

    getMonthlyWasteBagSummaryChart(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    >;

    getRegencyWasteBagSummaryChart(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    >;

    getEntityWasteBagSummaryChart(
        limit?: number,
        page?: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string
    ): Promise<{
        data: Array<{
            provinceName?: string;
            regencyName?: string;
            healthcareFacilityName: string;
            value: number;
        }>;
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getEntityWasteBagSummaryByGroup(
        limit?: number,
        page?: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
        lang?: string,
    ): Promise<{
        data: Array<{
            provinceName?: string;
            regencyName?: string;
            healthcareFacilityName: string;
            wasteGroupName: string;
            value: number;
        }>;
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getEntityWasteBagSummaryByCharacteristics(
        limit?: number,
        page?: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
        lang?: string
    ): Promise<{
        data: Array<{
            provinceName?: string;
            regencyName?: string;
            healthcareFacilityName: string;
            wasteFullName: string;
            value: number;
            avgValue: number;
            maxValue: number;
            gapValue: number;
        }>;
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }>;

    getEntityWasteBagSummaryByCharacteristicsExport(
        limit?: number,
        page?: number,
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
        lang?: string
    ): Promise<Buffer>;

    getProvinceWasteBagSummaryChart(
        startDate?: string,
        endDate?: string,
        provinceId?: number,
        regencyId?: number,
        healthcareFacilityId?: number,
        tag?: string,
        wasteTypeId?: number,
        wasteGroupId?: number,
        wasteCharacteristicsId?: number,
        isBags?: boolean,
        orderBy?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    >;
}
