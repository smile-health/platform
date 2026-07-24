import { Request, Response } from 'express';
import DashboardActivityRepositoryImpl from '../../../infrastructure/database/repositories/DashboardActivityRepositoryImpl';
import GetActivitySummariesForEntitiesUseCase from '../../../application/use-cases/dashboard-activity/GetActivitySummariesForEntities';
import GetActivityManualScaleForEntitiesUseCase from '../../../application/use-cases/dashboard-activity/GetActivityManualScaleForEntities';
import GetUserActivitySummaryUseCase from '../../../application/use-cases/dashboard-activity/GetUserActivitySummary';
import GetActivitySummariesForEntitiesExportUseCase from '../../../application/use-cases/dashboard-activity/GetActivitySummariesForEntitiesExport';

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

export async function getActivitySummariesForEntities(req: Request, res: Response) {
  try {
    const {
      limit,
      page,
      startDate,
      endDate,
      provinceId,
      regencyId,
      healthcareFacilityId,
      wasteTypeId,
      wasteGroupId,
      entityTag,
      typeOfProcessing,
    } = req.query;

    const repo = new DashboardActivityRepositoryImpl();
    const useCase = new GetActivitySummariesForEntitiesUseCase(repo);

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      startDate?.toString(),
      endDate?.toString(),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(healthcareFacilityId?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      entityTag?.toString(),
      typeOfProcessing?.toString(),
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

export async function getActivityManualScaleForEntities(req: Request, res: Response) {
  try {
    const {
      limit,
      page,
      startDate,
      endDate,
      provinceId,
      regencyId,
      healthcareFacilityId,
      wasteTypeId,
      wasteGroupId,
      entityTag,
    } = req.query;

    const repo = new DashboardActivityRepositoryImpl();
    const useCase = new GetActivityManualScaleForEntitiesUseCase(repo);

    const wasteBag = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      startDate?.toString(),
      endDate?.toString(),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(healthcareFacilityId?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      entityTag?.toString(),
    );
    console.log('get summary waste hierarchy successfully(controller):', wasteBag);
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

export async function exportActivitySummariesForEntities(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      provinceId,
      regencyId,
      healthcareFacilityId,
      wasteTypeId,
      wasteGroupId,
      entityTag,
      typeOfProcessing,
    } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const repo = new DashboardActivityRepositoryImpl();
    const useCase = new GetActivitySummariesForEntitiesExportUseCase(repo);

    const result = await useCase.execute(
      startDate.toString(),
      endDate.toString(),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(healthcareFacilityId?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      entityTag?.toString(),
      typeOfProcessing?.toString(),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `activity_summary_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getUserActivitySummary(req: Request, res: Response) {
  try {
    const {
      startDate,
      endDate,
      provinceId,
      regencyId,
      healthcareFacilityId,
      wasteTypeId,
      wasteGroupId,
      entityTag,
      typeOfProcessing,
    } = req.query;

    const repo = new DashboardActivityRepositoryImpl();
    const useCase = new GetUserActivitySummaryUseCase(repo);

    const wasteBag = await useCase.execute(
      startDate?.toString(),
      endDate?.toString(),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(healthcareFacilityId?.toString()),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      entityTag?.toString(),
      typeOfProcessing?.toString(),
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
