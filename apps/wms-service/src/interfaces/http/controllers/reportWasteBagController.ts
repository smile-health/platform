import { Request, Response } from 'express';
import GetAllTransactionWasteBagUseCase from '../../../application/use-cases/waste-bag/GetAllTransactionWasteBag';
import ReportWasteBagRepositoryImpl from '../../../infrastructure/database/repositories/ReportWasteBagRepositoryImpl';
import GetWasteBagSummaryByCharacteristicsUseCase from '../../../application/use-cases/waste-bag/GetWasteBagSummaryByCharacteristics';
import GetWasteBagHistoryUseCase from '../../../application/use-cases/waste-bag/GetWasteBagHistory';
import GetWasteBagLogBookUseCase from '../../../application/use-cases/waste-bag/GetWasteBagLogBook';
import GetWasteGroupDetailsUseCase from '../../../application/use-cases/waste-bag/GetWasteGroupDetails';
import GetWasteSourceSummaryUseCase from '../../../application/use-cases/waste-bag/GetWasteSourceSummary';
import { parseBoolean } from '../../../shared/utils/parseBoolean';
import GetWasteBagSummaryByWasteStatusUseCase from '../../../application/use-cases/waste-bag/GetWasteBagSummaryByWasteStatus';
import GetWasteBagDetailsInternalTreatmentUseCase from '../../../application/use-cases/waste-bag/GetWasteBagDetailsInternalTreatment';

export async function getAllTransactionWasteBagController(req: Request, res: Response) {
  try {
    const {
      limit,
      page,
      startDate,
      endDate,
      search,
      healthcareId,
      wasteTypeId,
      wasteGroupId,
      wasteCharacteristicsId,
      transporterId,
      treatmentStatus,
      provinceId,
      cityId,
    } = req.query;

    let entityId = req.user?.entity.id;
    let entityType = req.user?.entity.entity_type.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareId;

    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetAllTransactionWasteBagUseCase(repo);

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      startDate?.toString(),
      endDate?.toString(),
      search?.toString(),
      Number(resolvedHealthcareId?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      Number(wasteCharacteristicsId?.toString()),
      Number(transporterId?.toString()),
      treatmentStatus?.toString(),
      Number(provinceId?.toString()),
      Number(cityId?.toString()),
    );

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

export async function getWasteBagSummaryByCharacteristicsController(req: Request, res: Response) {
  try {
    const {
      limit,
      page,
      startDate,
      endDate,
      healthcareId,
      provinceId,
      cityId,
      includeWasteStatus,
    } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteBagSummaryByCharacteristicsUseCase(repo);

    let entityId = req.user?.entity.id;
    let entityType = req.user?.entity.entity_type.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareId;

    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      startDate?.toString(),
      endDate?.toString(),
      parseBoolean(includeWasteStatus?.toString()),
      Number(resolvedHealthcareId?.toString()),
      Number(provinceId?.toString()),
      Number(cityId?.toString()),
    );

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

export async function getWasteBagHistoryController(req: Request, res: Response): Promise<void> {
  try {
    const { wasteBagid, wasteBagQrCode, wasteGroupNumber } = req.query;

    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteBagHistoryUseCase(repo);

    const data = await useCase.execute(
      Number(wasteBagid?.toString()),
      wasteBagQrCode?.toString(),
      wasteGroupNumber?.toString(),
    );

    if (data && data.length > 0) {
      res.success(data);
    } else {
      res.success({ message: 'No waste bag history found.' });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function getWasteBagLogBookController(req: Request, res: Response) {
  try {
    const { limit, page, startDate, endDate, healthcareId, search } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }

    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteBagLogBookUseCase(repo);

    let entityId = req.user?.entity.id;
    let entityType = req.user?.entity.entity_type.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareId;

    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      Number(resolvedHealthcareId),
      startDate?.toString(),
      endDate?.toString(),
      search?.toString(),
    );

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

export async function getWasteGroupDetailsController(req: Request, res: Response) {
  try {
    const { wasteGroupId } = req.params;
    const { limit, page } = req.query;
    if (!wasteGroupId) {
      throw new Error('wasteGroupId are required.');
    }

    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteGroupDetailsUseCase(repo);

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      Number(wasteGroupId?.toString()),
    );
    console.log('Waste bag group details successfully(controller):', wasteBag);
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

export async function getWasteBagDetailsInternalTreatmentController(req: Request, res: Response) {
  try {
    const { wasteBagQrCodeId } = req.params;
    if (!wasteBagQrCodeId) {
      throw new Error('wasteBagQrCodeId are required.');
    }

    const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
    const lang = acceptLanguage.includes('en') ? 'en' : 'id';

    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteBagDetailsInternalTreatmentUseCase(repo);

    const wasteBag = await useCase.execute(wasteBagQrCodeId?.toString(), lang);
    console.log('Waste bag details successfully(controller):', wasteBag);
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

export async function getWasteSourceSummaryController(req: Request, res: Response) {
  try {
    const { limit, page, startDate, endDate, healthcareId, provinceId, cityId } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteSourceSummaryUseCase(repo);

    let entityId = req.user?.entity.id;
    let entityType = req.user?.entity.entity_type.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareId;

    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      startDate?.toString(),
      endDate?.toString(),
      Number(resolvedHealthcareId?.toString()),
      Number(provinceId?.toString()),
      Number(cityId?.toString()),
    );

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

export async function getWasteBagSummaryByWasteStatusController(req: Request, res: Response) {
  try {
    const { limit, page, healthcareId, startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const repo = new ReportWasteBagRepositoryImpl();
    const useCase = new GetWasteBagSummaryByWasteStatusUseCase(repo);

    let entityId = req.user?.entity.id;
    let entityType = req.user?.entity.entity_type.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareId;

    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      Number(resolvedHealthcareId?.toString()),
      startDate?.toString(),
      endDate?.toString(),
    );

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
