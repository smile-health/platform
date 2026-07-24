import { Request, Response } from 'express';
import DashboardRepositoryImpl from '../../../infrastructure/database/repositories/DashboardRepositoryImpl';
import GetSummaryWasteHierarchyUseCase from '../../../application/use-cases/dashboard/GetSummaryWasteHierarchy';
import GetSummaryWasteHierarchyByProvinceUseCase from '../../../application/use-cases/dashboard/GetSummaryWasteHierarchyByProvince';
import GetSummaryWasteHierarchyByCityUseCase from '../../../application/use-cases/dashboard/GetSummaryWasteHierarchyByCity';
import GetWasteGroupByAdminHealthcareFacilityUseCase from '../../../application/use-cases/dashboard/GetWasteGroupByAdminHealthcareFacility';
import GetWasteGroupByTransporterUseCase from '../../../application/use-cases/dashboard/GetWasteGroupByTransporter';
import GetWasteGroupByTreatmentUseCase from '../../../application/use-cases/dashboard/GetWasteGroupByTreatment';
import GetWasteGroupDetailsByActionUseCase from '../../../application/use-cases/dashboard/GetWasteGroupDetailsByAction';
import GetWasteCharacteSummaryUseCase from '../../../application/use-cases/dashboard/GetWasteCharacteristicsSummary';
import GetSummaryThisDayUseCase from '../../../application/use-cases/dashboard/GetSummaryThisDay';

export async function getSummaryWasteHierarchy(req: Request, res: Response) {
    try {
        const { limit, page, startDate, endDate } = req.query;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetSummaryWasteHierarchyUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            startDate?.toString(),
            endDate?.toString(),
        );
        console.log('get summary waste hierarchy successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getSummaryWasteHierarchyByProvince(req: Request, res: Response) {
    try {
        const { limit, page, startDate, endDate } = req.query;

        const { provinceId } = req.params;

        if (!provinceId) {
            throw new Error('provinceId are required.');
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetSummaryWasteHierarchyByProvinceUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            Number(provinceId?.toString()),
            startDate?.toString(),
            endDate?.toString(),
        );
        console.log('get summary waste hierarchy by province successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getSummaryWasteHierarchyByCity(req: Request, res: Response) {
    try {
        const { limit, page, startDate, endDate, healthcareFacilityId } = req.query;

        const { cityId } = req.params;

        if (!cityId) {
            throw new Error('cityId are required.');
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetSummaryWasteHierarchyByCityUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            token,
            Number(cityId?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(healthcareFacilityId?.toString()),
        );
        console.log('get summary waste hierarchy by city successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteGroupByAdminHealthcareFacility(req: Request, res: Response) {
    try {
        const {
            limit,
            page,
            wasteTypeId,
            healthcareFacilityId,
            wasteGroupId,
            wasteCharacteristicsId,
            wasteStatus,
            search,
        } = req.query;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        let entityId = req.user?.entity.id;
        let entityType = req.user?.entity.entity_type.name;

        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');

        let resolvedHealthcareId = healthcareFacilityId;

        if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
            resolvedHealthcareId = entityId.toString();
        }

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetWasteGroupByAdminHealthcareFacilityUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            token,
            Number(wasteTypeId?.toString()),
            Number(resolvedHealthcareId?.toString()),
            Number(wasteGroupId?.toString()),
            Number(wasteCharacteristicsId?.toString()),
            wasteStatus?.toString(),
            search?.toString(),
        );
        console.log('get waste group by admin HF successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteGroupByTransporter(req: Request, res: Response) {
    try {
        const { limit, page, healthcareFacilityId, provinceId, cityId, startDate, endDate, search } =
            req.query;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        let entityId = req.user?.entity.id;

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetWasteGroupByTransporterUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            token,
            Number(entityId?.toString()),
            Number(healthcareFacilityId?.toString()),
            Number(provinceId?.toString()),
            Number(cityId?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            search?.toString(),
        );
        console.log('get waste group by transporter(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteGroupByTreatment(req: Request, res: Response) {
    try {
        const {
            limit,
            page,
            healthcareFacilityId,
            disposalTreatment,
            provinceId,
            cityId,
            startDate,
            endDate,
            search
        } = req.query;

        if (!disposalTreatment) {
            res.fail('disposalTreatment required', {
                isValidationError: true,
            });
            return;
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        let entityId = req.user?.entity.id;

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetWasteGroupByTreatmentUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            token,
            Number(entityId?.toString()),
            disposalTreatment?.toString(),
            Number(healthcareFacilityId?.toString()),
            Number(provinceId?.toString()),
            Number(cityId?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            search?.toString(),
        );
        console.log('get waste group by transporter(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteGroupDetailsByActionController(req: Request, res: Response) {
    try {
        const { wasteGroupId } = req.params;
        const { limit, page, treatmentType } = req.query;
        if (!wasteGroupId) {
            throw new Error('wasteGroupId are required.');
        }

        const changeTreatmentType = (treatmentType ?? 'EX').toString();

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetWasteGroupDetailsByActionUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            Number(wasteGroupId.toString()),
            changeTreatmentType,
        );
        console.log('Waste bag group details by action successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getSummaryPerDayController(req: Request, res: Response) {
    try {
        const repo = new DashboardRepositoryImpl();
        const useCase = new GetSummaryThisDayUseCase(repo);

        const result = await useCase.execute(req.user?.entity.id as number)

        res.success(result)
    } catch (error) {
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getWasteCharacteristicsSummaryController(req: Request, res: Response) {
    try {
        const { wasteTypeId, provinceId, cityId, startDate, endDate, healthcareFacilityId } =
            req.query;

        if (!wasteTypeId) {
            throw new Error('wasteTypeId are required.');
        }

        const repo = new DashboardRepositoryImpl();
        const useCase = new GetWasteCharacteSummaryUseCase(repo);

        const wasteBag = await useCase.execute(
            Number(wasteTypeId.toString()),
            Number(provinceId?.toString()),
            Number(cityId?.toString()),
            startDate?.toString(),
            endDate?.toString(),
            Number(healthcareFacilityId?.toString()),
        );
        console.log('GetWasteCharacteSummary successfully(controller):', wasteBag);
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
