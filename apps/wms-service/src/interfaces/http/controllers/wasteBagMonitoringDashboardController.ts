import { Request, Response } from 'express';
import WasteBagMonitoringDashboardRepositoryImpl from '../../../infrastructure/database/repositories/WasteBagMonitoringDashboardRepositoryImpl';
import GetWasteCharacteristicsSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetWasteCharacteristicsSummaryChart';
import GetMonthlyWasteBagSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetMonthlyWasteBagSummaryChart';
import GetProvinceWasteBagSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetProvinceWasteBagSummaryChart';
import GetRegencyWasteBagSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetRegencyWasteBagSummaryChart';
import GetEntityWasteBagSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetEntityWasteBagSummaryChart';
import GetEntityWasteBagSummaryByGroupUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetEntityWasteBagSummaryByGroup';
import GetEntityWasteBagSummaryByCharacteristicsUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetEntityWasteBagSummaryByCharacteristics';
import GetWasteGroupSummaryChartUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetWasteGroupSummaryChart';
import { parseBoolean } from '../../../shared/utils/parseBoolean';
import GetEntityWasteBagSummaryByCharacteristicsExportUseCase from '../../../application/use-cases/wastebag-monitoring-dashboard/GetEntityWasteBagSummaryByCharacteristicsExport';

function tsForFilename(tz = 'Asia/Jakarta') {
    const d = new Date();
    const dtf = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
    const parts = Object.fromEntries(dtf.formatToParts(d).map((p) => [p.type, p.value]));
    return `${parts.year}${parts.month}${parts.day}_${parts.hour}${parts.minute}${parts.second}`;
}

const safe = (s: unknown) =>
    String(s ?? '')
        .trim()
        .replace(/[^\w.-]+/g, '-')
        .slice(0, 100);

function buildContentDisposition(filename: string) {
    const ascii = filename.replace(/[^\x20-\x7E]/g, '_');
    const rfc5987 = encodeURIComponent(filename);
    return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}

export async function getWasteGroupSummaryChart(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
        } = req.query;

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetWasteGroupSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            lang
        );
        console.log('getWasteGroupSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getWasteCharacteristicsSummaryChart(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
        } = req.query;

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetWasteCharacteristicsSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            lang
        );
        console.log('getWasteCharacteristicsSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getMonthlyWasteBagSummaryChart(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetMonthlyWasteBagSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool
        );
        console.log('getMonthlyWasteBagSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getProvinceWasteBagSummaryChart(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetProvinceWasteBagSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
        );
        console.log('getProvinceWasteBagSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getRegencyWasteBagSummaryChart(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetRegencyWasteBagSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
        );
        console.log('getRegencyWasteBagSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getEntityWasteBagSummaryChart(req: Request, res: Response) {
    try {
        const {
            limit,
            page,
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetEntityWasteBagSummaryChartUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
        );
        console.log('getEntityWasteBagSummaryChart successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getEntityWasteBagSummaryByGroup(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy,
            limit,
            page,
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetEntityWasteBagSummaryByGroupUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
            lang
        );
        console.log('getEntityWasteBagSummaryByGroup successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}

export async function getEntityWasteBagSummaryByCharacteristics(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy,
            limit,
            page,
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetEntityWasteBagSummaryByCharacteristicsUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
            lang
        );
        console.log('getEntityWasteBagSummaryByCharacteristics successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
    
}

export async function getEntityWasteBagSummaryByCharacteristicsExport(req: Request, res: Response) {
    try {
        const {
            startDate,
            endDate,
            provinceId,
            regencyId,
            healthcareFacilityId,
            entityTag,
            wasteTypeId,
            wasteGroupId,
            wasteCharacteristicsId,
            isBags,
            orderBy,
            limit,
            page,
        } = req.query;

        let isBagsBool: boolean | undefined;
        if (isBags) {
            isBagsBool = parseBoolean(isBags.toString());
        }

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        const repo = new WasteBagMonitoringDashboardRepositoryImpl();
        const useCase = new GetEntityWasteBagSummaryByCharacteristicsExportUseCase(repo);

        const result = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(provinceId?.toString()),
            Number(regencyId?.toString()),
            Number(healthcareFacilityId?.toString()),
            entityTag?.toString(),
            Number(wasteTypeId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            isBagsBool,
            orderBy?.toString(),
            lang
        );

        const buffer: Buffer = Buffer.isBuffer(result)
            ? result
            : Buffer.from(result as ArrayBuffer);

        const filename = `entity_full_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': buildContentDisposition(filename),
            'Cache-Control': 'no-store',
            'Content-Length': buffer.length.toString(),
        });

        res.status(200).send(buffer);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
