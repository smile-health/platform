import { Request, Response } from 'express';
import ReportWasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/ReportWasteBagRepositoryImpl';
import GetWasteBagSummaryByCharacteristicsUseCase from '../../../../application/use-cases/waste-bag/GetWasteBagSummaryByCharacteristics';
import GetWasteSourceSummaryUseCase from '../../../../application/use-cases/waste-bag/GetWasteSourceSummary';
import GetWasteBagSummaryByWasteStatusUseCase from '../../../../application/use-cases/waste-bag/GetWasteBagSummaryByWasteStatus';
import GetWasteBagByWasteStatusUseCase from '../../../../application/use-cases/waste-bag/GetWasteBagByWasteStatus';

export async function reportWasteBagController(req: Request, res: Response): Promise<void> {
  try {
    const { limit, page, startDate, endDate, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }

    const repo = new ReportWasteBagRepositoryImpl();
    const useCaseSummaryCharacteristic = new GetWasteBagSummaryByCharacteristicsUseCase(repo);
    const useCaseSummaryWasteSource = new GetWasteSourceSummaryUseCase(repo);
    const useCaseSummaryWasteStatus = new GetWasteBagSummaryByWasteStatusUseCase(repo);

    const resolvedLimit = Number(limit?.toString());
    const resolvedPage = Number(page?.toString());
    const resolvedStartDate = startDate?.toString();
    const resolvedEndDate = endDate?.toString();
    let resolvedEntityId = Number(req.user?.entity.id);
    if (healthcareFacilityId) {
      resolvedEntityId = Number(healthcareFacilityId);
    }

    const [resultSummaryCharacteristic, resultSummaryWasteSource, resultSummaryWasteStatus] =
      await Promise.all([
        useCaseSummaryCharacteristic.execute(
          resolvedLimit,
          resolvedPage,
          resolvedStartDate,
          resolvedEndDate,
          false,
          resolvedEntityId,
        ),
        useCaseSummaryWasteSource.execute(
          resolvedLimit,
          resolvedPage,
          resolvedStartDate,
          resolvedEndDate,
          resolvedEntityId,
        ),
        useCaseSummaryWasteStatus.execute(
          resolvedLimit,
          resolvedPage,
          resolvedEntityId,
          resolvedStartDate,
          resolvedEndDate,
        ),
      ]);
    const data = {
      resultSummaryCharacteristic: resultSummaryCharacteristic,
      resultSummaryWasteSource: resultSummaryWasteSource,
      resultSummaryWasteStatus: resultSummaryWasteStatus,
    };
    res.success(data);
  } catch (error) {
    console.error('Error in reportWasteBagController:', error);
    res.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

export async function reportWasteBagByStatusController(req: Request, res: Response): Promise<void> {
  try {
    const {
      limit,
      page,
      startDate,
      endDate,
      healthcareFacilityId,
      wasteTypeId,
      wasteGroupId,
      wasteStatus,
    } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }

    const repo = new ReportWasteBagRepositoryImpl();
    const useCaseSummaryWasteStatus = new GetWasteBagByWasteStatusUseCase(repo);

    const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
    const lang = acceptLanguage.includes('en') ? 'en' : 'id';

    const resolvedLimit = Number(limit?.toString());
    const resolvedPage = Number(page?.toString());
    const resolvedStartDate = startDate?.toString();
    const resolvedEndDate = endDate?.toString();
    let resolvedEntityId = Number(req.user?.entity.id);
    if (healthcareFacilityId) {
      resolvedEntityId = Number(healthcareFacilityId);
    }
    const resultSummaryWasteStatus = await useCaseSummaryWasteStatus.execute(
      resolvedLimit,
      resolvedPage,
      resolvedEntityId,
      resolvedStartDate,
      resolvedEndDate,
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      wasteStatus?.toString(),
      lang,
    );

    res.success(resultSummaryWasteStatus);
  } catch (error) {
    console.error('Error in reportWasteBagController:', error);
    res.error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}
