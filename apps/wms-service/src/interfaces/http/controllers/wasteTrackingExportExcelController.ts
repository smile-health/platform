import { Request, Response } from 'express';
import WasteTrackingExportExcelRepositoryImpl from '../../../infrastructure/database/repositories/WasteTrackingExportExcelRepositoryImpl';
import WasteCharacteristicsSummaryExportExcelUseCase from '../../../application/use-cases/export-excel/WasteCharacteristicsExportExcelUseCase';
import WasteSourceSummaryExportExcelUseCase from '../../../application/use-cases/export-excel/WasteSourceExportExcelUseCase';
import WasteBagExportExcelUseCase from '../../../application/use-cases/export-excel/WasteBagExportExcelUseCase';
import WasteGroupExportExcelUseCase from '../../../application/use-cases/export-excel/WasteGroupExportExcelUseCase';
import WasteTrackingAllExportExcelUseCase from '../../../application/use-cases/export-excel/WasteTrackingAllExportExcelUseCase';
import WasteExternalExportExcelUseCase from '../../../application/use-cases/export-excel/WasteExternalExcelUseCase';

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

export async function getWasteCharacteristicsSummaryExportExcel(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteCharacteristicsSummaryExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `waste_characteristics_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getWasteSourceSummaryExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteSourceSummaryExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `waste_source_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getWasteBagExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const {
      startDate,
      endDate,
      provinceId,
      regencyId,
      healthcareFacilityId,
      search,
      wasteTypeId,
      wasteGroupId,
      wasteCharacteristicsId,
    } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteBagExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
      search?.toString(),
      Number(wasteTypeId?.toString()),
      Number(wasteGroupId?.toString()),
      Number(wasteCharacteristicsId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `waste_bag_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getWasteGroupExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteGroupExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `waste_group_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getWasteExternalExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length); // disiapkan kalau use case butuh token

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteExternalExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `pelacakan_limbah_keluar_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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

export async function getWasteTrackingAllExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate, provinceId, regencyId, healthcareFacilityId } = req.query;

    if (!startDate || !endDate) {
      throw new Error('startDate and endDate are required.');
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length);
    const role = req.user?.external_properties?.role.type ?? '';
    const typeEntity = req.user?.entity?.type;

    // Eksekusi use case
    const repo = new WasteTrackingExportExcelRepositoryImpl();
    const useCase = new WasteTrackingAllExportExcelUseCase(repo);

    const entityId = req.user?.entity?.id;
    const entityType = req.user?.entity?.entity_type?.name;

    const roles = Array.isArray(req.user?.external_roles) ? req.user!.external_roles : [];
    const isSuperAdmin = roles.includes('super_admin');

    let resolvedHealthcareId = healthcareFacilityId;
    if (entityId && entityType === 'healthcare_facility' && !isSuperAdmin) {
      resolvedHealthcareId = entityId.toString();
    }

    const result = await useCase.execute(
      String(startDate),
      String(endDate),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      Number(resolvedHealthcareId?.toString()),
      role,
      typeEntity,
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const filename = `waste_all_${safe(startDate)}_${safe(endDate)}_${tsForFilename('Asia/Jakarta')}.xlsx`;

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
