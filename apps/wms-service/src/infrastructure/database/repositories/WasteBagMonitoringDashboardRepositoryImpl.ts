import WasteBagMonitoringDashboardRepository from '../../../domain/repositories/WasteBagMonitoringDashboardRepository';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../db.connection';
import { paginationUtils } from '../../../shared/utils/pagination';
import ExcelJS from 'exceljs';

export default class WasteBagMonitoringDashboardRepositoryImpl
    implements WasteBagMonitoringDashboardRepository
{
    async getWasteGroupSummaryChart(
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
            labelType: string;
            label: string;
            value: number;
        }>;
    }> {
        try {
            const whereClauses: string[] = ['wg.is_active = 1'];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }
            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }
            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            // --- Tag Filter ---
            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');
                whereClauses.push(`et.tag IN (${cleaned})`);
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }
            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }
            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

            // --- Query ---
            const query = `
            SELECT 
                wt.name AS wasteTypeName,
                wt.name_en AS wasteTypeNameEn,
                wg.name AS wasteGroupName,
                wg.name_en AS wasteGroupNameEn,
                COUNT(*) AS totalBags,
                COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight
            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
            LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
            ${whereClause}
            GROUP BY wg.id, wt.id
            ORDER BY wt.name, wg.name;
        `;

            const results = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const formatted = (results as any[]).map((r) => ({
                labelType: lang === 'en' ? r.wasteTypeNameEn : r.wasteTypeName,
                label: lang === 'en' ? r.wasteGroupNameEn : r.wasteGroupName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            const total = formatted.reduce((sum, r) => sum + r.value, 0);

            return {
                total,
                data: formatted,
            };
        } catch (error) {
            console.error('Error in getWasteGroupSummaryChart:', error);
            throw error;
        }
    }

    async getWasteCharacteristicsSummaryChart(
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
    > {
        try {
            const whereClauses: string[] = ['wch.is_active = 1'];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            let orderBy = `ORDER BY wb.totalWeight DESC`;
            if (isBags) {
                orderBy = `ORDER BY wb.totalBags DESC`;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

            // --- Query ---
            const query = `
            SELECT * FROM (
                SELECT 
                wch.name AS wasteTypeName,
                wch.name_en AS wasteTypeNameEn,
                COUNT(*) AS totalBags,
                COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY wch.id) wb
                ${orderBy}
                ;
            `;

            const results = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const formatted = (results as any[]).map((r) => ({
                label: lang === 'en' ? r.wasteTypeNameEn : r.wasteTypeName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            return formatted;
        } catch (error) {
            console.error('Error in getWasteTypeSummaryChart:', error);
            throw error;
        }
    }

    async getMonthlyWasteBagSummaryChart(
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
    > {
        try {
            const whereClauses: string[] = [];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

            // --- Query ---
            const query = `
                SELECT DATE_FORMAT(wb.created_at, '%m-%Y') AS labelMonth, COUNT(*) AS totalBags, 
                COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight 
                FROM waste_bag wb 
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id 
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY YEAR(wb.created_at), MONTH(wb.created_at)
                ORDER BY YEAR(wb.created_at), MONTH(wb.created_at);
            `;

            const results = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const formatted = (results as any[]).map((r) => ({
                label: r.labelMonth,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            return formatted;
        } catch (error) {
            console.error('Error in getMonthlyWasteBagSummary:', error);
            throw error;
        }
    }

    async getRegencyWasteBagSummaryChart(
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
        orderDirection?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    > {
        try {
            const whereClauses: string[] = [];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            // --- Entity Tag Filter ---
            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

            let orderBy = `ORDER BY wb.totalWeight DESC`;
            if (isBags) {
                orderBy = `ORDER BY wb.totalBags DESC`;
            }
            if (orderDirection) {
                orderBy = `ORDER BY wb.provinceId ${orderDirection};`;
            }

            const query = `
                SELECT * FROM (
                SELECT
                    et.province_id AS provinceId, 
                    et.regency_name AS regencyName,
                    COUNT(*) AS totalBags,
                    COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY wb.regency_id) wb
                ${orderBy};
            `;

            const results = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const formatted = (results as any[]).map((r) => ({
                label: r.regencyName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            return formatted;
        } catch (error) {
            console.error('Error in getRegencyWasteBagSummaryChart:', error);
            throw error;
        }
    }

    async getEntityWasteBagSummaryChart(
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
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
                maxLimit: 200,
            });
            const offset = (safePage - 1) * safeLimit;

            const whereClauses: string[] = [];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            // --- Entity Tag Filter ---
            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
            const orderDirection = orderBy?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const baseQuery = `
                SELECT 
                    et.province_name AS provinceName,
                    et.regency_name AS regencyName,
                    et.name AS healthcareFacilityName,
                    COUNT(*) AS totalBags,
                    COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY wb.healthcare_facility_id
            `;

            const dataQuery = `
                ${baseQuery}
                ORDER BY wb.province_id ${orderDirection}, et.name ASC
                LIMIT :limit OFFSET :offset;
            `;

            const countQuery = `
                SELECT COUNT(*) AS total FROM (
                    ${baseQuery}
                ) AS grouped;
            `;

            const countResults = await sequelize.query(countQuery, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const results = await sequelize.query(dataQuery, {
                type: QueryTypes.SELECT,
                replacements: {
                    ...replacements,
                    limit: safeLimit,
                    offset,
                },
            });

            const formatted = (results as any[]).map((r) => ({
                provinceName: r.provinceName,
                regencyName: r.regencyName,
                healthcareFacilityName: r.healthcareFacilityName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            const totalCount = Number((countResults as Array<{ total: number }>)[0]?.total) || 0;

            return paginationUtils.formatPaginationResult(
                formatted,
                totalCount,
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error in getEntityWasteBagSummaryChart:', error);
            throw error;
        }
    }

    async getEntityWasteBagSummaryByGroup(
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
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
                maxLimit: 200,
            });
            const offset = (safePage - 1) * safeLimit;

            const whereClauses: string[] = [];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            // --- Entity Tag Filter ---
            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
            const orderDirection = orderBy?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

            const baseQuery = `
                SELECT 
                    et.province_name AS provinceName,
                    et.regency_name AS regencyName,
                    et.name AS healthcareFacilityName,
                    wg.name AS wasteGroupName,
                    wg.name_en AS wasteGroupNameEn,
                    COUNT(*) AS totalBags,
                    COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight
                FROM waste_bag wb
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id
                JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY wb.healthcare_facility_id, wc.waste_group_id
            `;

            const dataQuery = `
                ${baseQuery}
                ORDER BY wb.province_id ${orderDirection}, et.name ASC, wg.name ASC
                LIMIT :limit OFFSET :offset;
            `;

            const countQuery = `
                SELECT COUNT(*) AS total FROM (
                    ${baseQuery}
                ) AS grouped;
            `;

            const countResults = await sequelize.query(countQuery, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const results = await sequelize.query(dataQuery, {
                type: QueryTypes.SELECT,
                replacements: {
                    ...replacements,
                    limit: safeLimit,
                    offset,
                },
            });

            const formatted = (results as any[]).map((r) => ({
                provinceName: r.provinceName,
                regencyName: r.regencyName,
                healthcareFacilityName: r.healthcareFacilityName,
                wasteGroupName: lang === 'en' ? r.wasteGroupNameEn : r.wasteGroupName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            const totalCount = Number((countResults as Array<{ total: number }>)[0]?.total) || 0;

            return paginationUtils.formatPaginationResult(
                formatted,
                totalCount,
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error in getEntityWasteBagSummaryByGroup:', error);
            throw error;
        }
    }

    async getProvinceWasteBagSummaryChart(
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
        orderDirection?: string,
    ): Promise<
        Array<{
            label: string;
            value: number;
        }>
    > {
        try {
            const whereClauses: string[] = [];
            const replacements: Record<string, any> = {};

            // --- Location Filters ---
            if (provinceId) {
                whereClauses.push('wb.province_id = :provinceId');
                replacements.provinceId = provinceId;
            }

            if (regencyId) {
                whereClauses.push('wb.regency_id = :regencyId');
                replacements.regencyId = regencyId;
            }

            if (healthcareFacilityId) {
                whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
                replacements.healthcareFacilityId = healthcareFacilityId;
            }

            // --- Date Filter ---
            if (startDate && endDate) {
                whereClauses.push(`CONVERT_TZ(wb.created_at, '+00:00', '+07:00') BETWEEN :startDate AND :endDate`);
                replacements.startDate = `${startDate} 00:00:00`;
                replacements.endDate = `${endDate} 23:59:59`;
            }

            if (tag) {
                const cleaned = tag
                    .split(',')
                    .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                    .join(', ');

                whereClauses.push(`et.tag IN (${cleaned})`);
                replacements.cleaned = cleaned;
            }

            // --- Waste Filters ---
            if (wasteTypeId) {
                whereClauses.push('wc.waste_type_id = :wasteTypeId');
                replacements.wasteTypeId = wasteTypeId;
            }

            if (wasteGroupId) {
                whereClauses.push('wc.waste_group_id = :wasteGroupId');
                replacements.wasteGroupId = wasteGroupId;
            }

            if (wasteCharacteristicsId) {
                whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
                replacements.wasteCharacteristicsId = wasteCharacteristicsId;
            }

            const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

            let orderBy = `ORDER BY wb.totalWeight DESC`;
            if (isBags) {
                orderBy = `ORDER BY wb.totalBags DESC`;
            }
            if (orderDirection) {
                orderBy = `ORDER BY wb.province_id ${orderDirection};`;
            }

            // --- Query ---
            const query = `
                SELECT * FROM (
                SELECT et.province_id, et.province_name AS provinceName, COUNT(*) AS totalBags, 
                COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeight 
                FROM waste_bag wb 
                JOIN waste_classification wc ON wc.id = wb.waste_classification_id 
                LEFT JOIN entities et ON et.id = wb.healthcare_facility_id
                ${whereClause}
                GROUP BY wb.province_id) wb
                ${orderBy};
            `;

            const results = await sequelize.query(query, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const formatted = (results as any[]).map((r) => ({
                label: r.provinceName,
                value: isBags ? Number(r.totalBags) || 0 : Number(r.totalWeight) || 0,
            }));

            return formatted;
        } catch (error) {
            console.error('Error in getMonthlyWasteBagSummary:', error);
            throw error;
        }
    }

    async getEntityWasteBagSummaryByCharacteristics(
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
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
                maxLimit: 200,
            });
            const offset = (safePage - 1) * safeLimit;
            const { baseQuery, countQuery, replacements } = await this.buildWasteBagSummaryQuery({
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
                tag,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
            });

            const dataQuery = `
                ${baseQuery}
                ORDER BY et.province_name ASC, et.name ASC, wasteFullName ASC
                LIMIT :limit OFFSET :offset
            `;

            const countResults = await sequelize.query(countQuery, {
                type: QueryTypes.SELECT,
                replacements,
            });

            const results = await sequelize.query(dataQuery, {
                type: QueryTypes.SELECT,
                replacements: { ...replacements, limit: safeLimit, offset },
            });

            const formatted = (results as any[]).map((r) => ({
                provinceName: r.provinceName,
                regencyName: r.regencyName,
                healthcareFacilityName: r.healthcareFacilityName,
                wasteFullName: lang === 'en' ? r.wasteFullNameEn : r.wasteFullName,
                value: isBags
                    ? Number(r.totalBagsCurrentMonth) || 0
                    : Number(r.totalWeightCurrentMonth) || 0,
                avgValue: isBags
                    ? Number(r.avgBagsPrev3Months) || 0
                    : Number(r.avgWeightPrev3Months) || 0,
                maxValue: isBags
                    ? Number(r.maxBagsPrev3Months) || 0
                    : Number(r.maxWeightPrev3Months) || 0,
                gapValue: isBags
                    ? Number(r.gapTimbulanBags) || 0
                    : Number(r.gapTimbulanWeight) || 0,
            }));

            const totalCount = Number((countResults as Array<{ total: number }>)[0]?.total) || 0;

            return paginationUtils.formatPaginationResult(
                formatted,
                totalCount,
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error in getEntityWasteBagSummaryByCharacteristics:', error);
            throw error;
        }
    }

    async getEntityWasteBagSummaryByCharacteristicsExport(
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
        lang?: string,
    ): Promise<Buffer> {
        try {
            const safeLimit = Number.isFinite(Number(limit)) ? Number(limit) : 99999;
            const safePage = Number.isFinite(Number(page)) ? Number(page) : 1;
            const offset = (safePage - 1) * safeLimit;

            // =============================
            // 🔹 Build query dari repository
            // =============================
            const { baseQuery, replacements } = await this.buildWasteBagSummaryQuery({
                startDate,
                endDate,
                provinceId,
                regencyId,
                healthcareFacilityId,
                tag,
                wasteTypeId,
                wasteGroupId,
                wasteCharacteristicsId,
            });

            // Eksekusi query data
            const results = await sequelize.query(
                `${baseQuery} ORDER BY et.province_name ASC, et.name ASC, wasteFullName ASC LIMIT :limit OFFSET :offset`,
                {
                    type: QueryTypes.SELECT,
                    replacements: { ...replacements, limit: safeLimit, offset },
                },
            );

            const data = results as any[];
            const wb = new ExcelJS.Workbook();
            wb.creator = 'WMS';
            wb.created = new Date();

            const ws = wb.addWorksheet('Timbulan Per Entitas Lengkap', {
                headerFooter: {
                    firstHeader: 'WMS - Timbulan Per Entitas Lengkap',
                    firstFooter: 'WMS Report Export',
                },
                views: [{ state: 'frozen', ySplit: 4 }],
            });

            const fmtIdLong = (date: string) =>
                new Date(date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                });

            const displayStart = startDate ?? 'N/A';
            const displayEnd = endDate ?? 'N/A';

            const titleText =
                lang === 'en'
                    ? `Waste Bag By Entity Complete (${isBags ? 'Bag' : 'Weight'})`
                    : `Timbulan Per Entitas Lengkap (${isBags ? 'Kantong' : 'KG'})`;
            const periodText = `${fmtIdLong(displayStart)} - ${fmtIdLong(displayEnd)}`;

            ws.addRow([titleText]);
            ws.mergeCells('A1:I1');
            ws.getCell('A1').font = { bold: true, size: 14 };
            ws.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

            ws.addRow([periodText]);
            ws.mergeCells('A2:I2');
            ws.getCell('A2').font = { bold: true, size: 14 };
            ws.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };

            ws.addRow([]); // spasi sebelum header

            const staticHeaders =
                lang === 'en'
                    ? [
                          'No',
                          'Province',
                          'Regency/City',
                          'Healthcare Facility',
                          'Waste Type - Group - Characteristics',
                          isBags ? 'Total Bags (Current Month)' : 'Total Weight (kg)',
                          isBags ? 'Avg Bags (Last 3 Months)' : 'Avg Weight (kg) (Last 3 Months)',
                          isBags ? 'Max Bags (Last 3 Months)' : 'Max Weight (kg) (Last 3 Months)',
                          isBags ? 'Gap Bags' : 'Gap Weight (kg)',
                      ]
                    : [
                          'No',
                          'Provinsi',
                          'Kabupaten/Kota',
                          'Nama Entitas',
                          'Jenis / Kelompok / Karakteristik Limbah',
                          isBags ? 'Total Timbulan' : 'Total Timbulan',
                          isBags
                              ? 'Proyeksi Timbulan (Rata2 timbulan)'
                              : 'Proyeksi Timbulan (Rata2 timbulan)',
                          isBags ? 'Max Timbulan' : 'Max Timbulan',
                          isBags ? 'Gap Timbulan' : 'Gap Timbulan',
                      ];

            ws.addRow(staticHeaders);

            const headerRow = ws.getRow(4);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '4472C4' },
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });

            ws.columns = [
                { width: 5 },
                { width: 18 },
                { width: 18 },
                { width: 30 },
                { width: 40 },
                { width: 22 },
                { width: 25 },
                { width: 25 },
                { width: 18 },
            ];

            // =============================
            // 🔹 Isi Data
            // =============================
            data.forEach((r, index) => {
                const wasteFullName = lang === 'en' ? r.wasteFullNameEn : r.wasteFullName;
                ws.addRow([
                    index + 1,
                    r.provinceName || '-',
                    r.regencyName || '-',
                    r.healthcareFacilityName,
                    wasteFullName,
                    isBags
                        ? Number(r.totalBagsCurrentMonth) || 0
                        : Number(r.totalWeightCurrentMonth) || 0,
                    isBags
                        ? Number(r.avgBagsPrev3Months) || 0
                        : Number(r.avgWeightPrev3Months) || 0,
                    isBags
                        ? Number(r.maxBagsPrev3Months) || 0
                        : Number(r.maxWeightPrev3Months) || 0,
                    isBags ? Number(r.gapTimbulanBags) || 0 : Number(r.gapTimbulanWeight) || 0,
                ]);
            });

            // =============================
            // 🔹 Styling Data Rows
            // =============================
            ws.eachRow((row, rowNumber) => {
                if (rowNumber <= 4) return;
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    cell.alignment = {
                        horizontal: colNumber >= 6 ? 'right' : 'left',
                        vertical: 'middle',
                    };
                });

                if (rowNumber > 4 && rowNumber % 2 === 0) {
                    row.eachCell((cell) => {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'F2F2F2' },
                        };
                    });
                }
            });

            // =============================
            // 🔹 Tambah Total di Bawah
            // =============================
            if (data.length > 0) {
                const totalValue = (key: string) =>
                    data.reduce((sum, d) => sum + (Number(d[key]) || 0), 0);

                const totalRow = [
                    '',
                    '',
                    '',
                    '',
                    lang === 'en' ? 'TOTAL' : 'TOTAL',
                    totalValue(isBags ? 'totalBagsCurrentMonth' : 'totalWeightCurrentMonth'),
                    totalValue(isBags ? 'avgBagsPrev3Months' : 'avgWeightPrev3Months'),
                    totalValue(isBags ? 'maxBagsPrev3Months' : 'maxWeightPrev3Months'),
                    totalValue(isBags ? 'gapTimbulanBags' : 'gapTimbulanWeight'),
                ];

                const row = ws.addRow(totalRow);
                row.font = { bold: true };
                row.eachCell((cell, colNumber) => {
                    cell.border = {
                        top: { style: 'double' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    cell.alignment = {
                        horizontal: colNumber >= 6 ? 'right' : 'left',
                    };
                });
            }

            // =============================
            // 🔹 Filter & Freeze Pane
            // =============================
            ws.autoFilter = { from: 'A4', to: 'I4' };
            ws.views = [{ state: 'frozen', ySplit: 4 }];

            // =============================
            // 🔹 Return Buffer
            // =============================
            const buffer = await wb.xlsx.writeBuffer();
            return Buffer.from(buffer);
        } catch (error) {
            console.error('Error in getEntityWasteBagSummaryByCharacteristicsExport:', error);
            throw error;
        }
    }

    async buildWasteBagSummaryQuery(params: {
        startDate?: string;
        endDate?: string;
        provinceId?: number;
        regencyId?: number;
        healthcareFacilityId?: number;
        tag?: string;
        wasteTypeId?: number;
        wasteGroupId?: number;
        wasteCharacteristicsId?: number;
    }) {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            tag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
        } = params;

        const whereClauses: string[] = [];
        const replacements: Record<string, any> = {};

        if (provinceId) {
            whereClauses.push('wb.province_id = :provinceId');
            replacements.provinceId = provinceId;
        }

        if (regencyId) {
            whereClauses.push('wb.regency_id = :regencyId');
            replacements.regencyId = regencyId;
        }

        if (healthcareFacilityId) {
            whereClauses.push('wb.healthcare_facility_id = :healthcareFacilityId');
            replacements.healthcareFacilityId = healthcareFacilityId;
        }

        if (tag) {
            const cleaned = tag
                .split(',')
                .map((v) => `'${v.replace(/['"`]/g, '').trim()}'`)
                .join(', ');
            whereClauses.push(`et.tag IN (${cleaned})`);
        }

        if (wasteTypeId) {
            whereClauses.push('wc.waste_type_id = :wasteTypeId');
            replacements.wasteTypeId = wasteTypeId;
        }

        if (wasteGroupId) {
            whereClauses.push('wc.waste_group_id = :wasteGroupId');
            replacements.wasteGroupId = wasteGroupId;
        }

        if (wasteCharacteristicsId) {
            whereClauses.push('wc.waste_characteristics_id = :wasteCharacteristicsId');
            replacements.wasteCharacteristicsId = wasteCharacteristicsId;
        }

        replacements.currentStart = `${startDate} 00:00:00`;
        replacements.currentEnd = `${endDate} 23:59:59`;

        const whereClause = whereClauses.length ? `AND ${whereClauses.join(' AND ')}` : '';

        const prev3MonthsQuery = this.buildPrev3MonthsSubquery();

        const baseQuery = `
            SELECT 
                et.province_name AS provinceName,
                et.regency_name AS regencyName,
                et.name AS healthcareFacilityName,
                CONCAT(wt.name, ' - ', wg.name, ' - ', wch.name) AS wasteFullName,
                CONCAT(wt.name_en, ' - ', wg.name_en, ' - ', wch.name_en) AS wasteFullNameEn,

                COUNT(*) AS totalBagsCurrentMonth,
                COALESCE(SUM(wb.weight_in_kgs), 0) AS totalWeightCurrentMonth,

                COALESCE(ROUND(prev.avgBagsPrev3Months, 2), 0) AS avgBagsPrev3Months,
                COALESCE(ROUND(prev.avgWeightPrev3Months, 2), 0) AS avgWeightPrev3Months,

                COALESCE(prev.maxBagsPrev3Months, 0) AS maxBagsPrev3Months,
                COALESCE(prev.maxWeightPrev3Months, 0) AS maxWeightPrev3Months,

                COUNT(*) - COALESCE(prev.maxBagsPrev3Months, 0) AS gapTimbulanBags,
                COALESCE(SUM(wb.weight_in_kgs), 0) - COALESCE(prev.maxWeightPrev3Months, 0) AS gapTimbulanWeight

            FROM waste_bag wb
            JOIN waste_classification wc ON wc.id = wb.waste_classification_id
            JOIN waste_hierarchy wt ON wt.id = wc.waste_type_id
            JOIN waste_hierarchy wg ON wg.id = wc.waste_group_id
            JOIN waste_hierarchy wch ON wch.id = wc.waste_characteristics_id
            LEFT JOIN entities et ON et.id = wb.healthcare_facility_id

            LEFT JOIN (${prev3MonthsQuery}) AS prev 
              ON prev.healthcare_facility_id = wb.healthcare_facility_id 
             AND prev.waste_characteristics_id = wc.waste_characteristics_id

            WHERE CONVERT_TZ(wb.created_at,'+00:00','+07:00') BETWEEN :currentStart AND :currentEnd
            ${whereClause}
            GROUP BY wb.healthcare_facility_id, wc.waste_characteristics_id
        `;

        const countQuery = `SELECT COUNT(*) AS total FROM (${baseQuery}) AS grouped;`;

        return { baseQuery, countQuery, replacements };
    }

    private buildPrev3MonthsSubquery(): string {
        return `
            SELECT 
                monthly.healthcare_facility_id,
                monthly.waste_characteristics_id,
                AVG(monthly.totalBags) AS avgBagsPrev3Months,
                AVG(monthly.totalWeight) AS avgWeightPrev3Months,
                MAX(monthly.totalBags) AS maxBagsPrev3Months,
                MAX(monthly.totalWeight) AS maxWeightPrev3Months
            FROM (
                SELECT 
                    wb2.healthcare_facility_id,
                    wc2.waste_characteristics_id,
                    DATE_FORMAT(wb2.created_at, '%Y-%m') AS monthLabel,
                    COUNT(*) AS totalBags,
                    COALESCE(SUM(wb2.weight_in_kgs), 0) AS totalWeight
                FROM waste_bag wb2
                JOIN waste_classification wc2 ON wc2.id = wb2.waste_classification_id
                WHERE CONVERT_TZ(wb2.created_at,'+00:00','+07:00') >= DATE_SUB(:currentStart, INTERVAL 3 MONTH)
                      AND CONVERT_TZ(wb2.created_at,'+00:00','+07:00') < :currentStart
                GROUP BY wb2.healthcare_facility_id, wc2.waste_characteristics_id, monthLabel
            ) AS monthly
            GROUP BY monthly.healthcare_facility_id, monthly.waste_characteristics_id
        `;
    }
}
