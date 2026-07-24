import { Request, Response } from 'express';
import PartnerVehicleImpl from '../../../infrastructure/database/repositories/PartnerVehicleRepositoryImpl';
import CreatePartnerVehicle from '../../../application/use-cases/partner-vehicle/CreatePartnerVehicle';
import GetPartnerVehicle from '../../../application/use-cases/partner-vehicle/GetPartnerVehicle';
import UpdatePartnerVehicle from '../../../application/use-cases/partner-vehicle/UpdateParterVehicle';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/partner-vehicle/DeletePartnerVehicle';
import GetAllPartnerVehicleByIdUseCase from '../../../application/use-cases/partner-vehicle/GetAllPartnerVehicle';
import ExportPartnerVehicleToExcelUseCase from '../../../application/use-cases/partner-vehicle/ExportPartnerVehicleToExcel';
import CreateMultipleHealthcarePartnerVehicleUseCase from '../../../application/use-cases/partner-vehicle/CreateMultipleHealthcarePartnerVehicle';

export async function createPartnerVehicle(req: Request, res: Response): Promise<void> {
  try {
    const repo = new PartnerVehicleImpl();
    const useCase = new CreatePartnerVehicle(repo);

    const data = await useCase.execute({
      ...req.body,
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      transporterId: req.user?.entity.id,
    });
    console.log('Waste source created successfully(controller):', data);
    res.success(data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function createMultipleHealthcarePartnerVehicle(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const repo = new PartnerVehicleImpl();
    const useCase = new CreateMultipleHealthcarePartnerVehicleUseCase(repo);

    const data = await useCase.execute({
      ...req.body,
      entityId: 1, //replace pd saat insert
      createdBy: req.user?.user_uuid,
      updatedBy: req.user?.user_uuid,
      transporterId: req.user?.entity.id,
    });
    console.log('Multiple healthcare vehicle created successfully(controller):', data);
    res.success(data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function getPartnerVehicleById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
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

    const repo = new PartnerVehicleImpl();
    const useCase = new GetPartnerVehicle(repo);

    const data = await useCase.execute(id, token);

    if (data === null) {
      res.fail('Waste source not found');
      return;
    } else {
      res.success(data);
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

export async function getAllPartnerVehicles(req: Request, res: Response): Promise<void> {
  try {
    const { limit, page, search, healthcareFacilityId, providerId } = req.query;
    const repo = new PartnerVehicleImpl();
    const useCase = new GetAllPartnerVehicleByIdUseCase(repo);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const transporterId = req.user?.entity.id;
    const entityType = req.user?.entity?.entity_type?.name;

    let entityTag = req.user?.entity.tag;

    const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

    if (allowedTypes.includes(entityType)) {
      entityTag = 'hospital';
    }

    if (!transporterId) {
      res.fail('Unauthorized: Missing entity ID', {
        isValidationError: true,
      });
      return;
    }

    return await useCase
      .execute(
        Number(limit?.toString()),
        Number(page?.toString()),
        token.toString(),
        transporterId,
        search?.toString(),
        entityTag,
        Number(healthcareFacilityId?.toString()),
        Number(providerId?.toString()),
      )
      .then((data) => {
        res.success(data);
      })
      .catch((error) => {
        console.error('Error retrieving Waste source:', error);
        if (error instanceof Error || typeof error === 'string') {
          res.error(error);
        } else {
          res.error(req.t('common.server-error'));
        }
      });
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

export async function updatePartnerVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const repo = new PartnerVehicleImpl();
    const useCase = new UpdatePartnerVehicle(repo);

    const data = await useCase.execute({
      ...req.body,
      id: Number(id),
      updatedBy: req.user?.user_uuid,
    });
    if (data === null) {
      res.fail('Waste source not found');
      return;
    } else {
      res.success(data);
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

export async function deletePartnerVehicle(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const repo = new PartnerVehicleImpl();
    const useCase = new DeleteHealthcareFacilityAsset(repo);

    const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
    console.log('Partner Vehicle deleted successfully(controller):', data);

    if (!data) {
      res.fail(`Partner Vehicle with ID ${id} not deleted`);
      return;
    }

    res.success(data);
  } catch (error) {
    console.error(error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t('common.server-error'));
    }
  }
}

function buildContentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_');
  const rfc5987 = encodeURIComponent(filename);
  return `attachment; filename="${ascii}"; filename*=UTF-8''${rfc5987}`;
}

export async function getPartnerVehicleExportExcel(req: Request, res: Response): Promise<void> {
  try {
    const { search, healthcareFacilityId } = req.query;
    const repo = new PartnerVehicleImpl();
    const useCase = new ExportPartnerVehicleToExcelUseCase(repo);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), { isValidationError: true });
      return;
    }
    const token = authHeader.slice('Bearer '.length);

    const transporterId = req.user?.entity.id;
    const entityType = req.user?.entity?.entity_type?.name;

    let entityTag = req.user?.entity.tag;

    const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];

    if (allowedTypes.includes(entityType)) {
      entityTag = 'hospital';
    }

    if (!transporterId) {
      res.fail('Unauthorized: Missing entity ID', {
        isValidationError: true,
      });
      return;
    }

    const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
    const lang = acceptLanguage.includes('en') ? 'en' : 'id';

    const result = await useCase.execute(
      token.toString(),
      transporterId,
      lang,
      search?.toString(),
      entityTag,
      Number(healthcareFacilityId?.toString()),
    );

    const buffer: Buffer = Buffer.isBuffer(result) ? result : Buffer.from(result as ArrayBuffer);

    const now = new Date();

    // format: 20260108_093015
    const formattedDate = now.toISOString().replace(/[-:]/g, '').replace('T', '_').slice(0, 15);

    const filename = `vehicle_${formattedDate}.xlsx`;

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
