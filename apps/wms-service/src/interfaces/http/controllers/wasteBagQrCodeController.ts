import { Request, Response } from 'express';
import WasteBagQrCodeImpl from '../../../infrastructure/database/repositories/WasteBagQrCodeRepoitoryImpl';
import GetWasteBagQrCode from '../../../application/use-cases/waste-bag-qr-code/GetWasteBagQrCode';
import UpdateWasteBagQrCode from '../../../application/use-cases/waste-bag-qr-code/UpdateWasteBagQrCode';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/waste-bag-qr-code/DeleteWasteBagQrCode';
import GetAllWasteBagQrCodeUseCase from '../../../application/use-cases/waste-bag-qr-code/GetAllWasteBagQrCode';
import WasteSourceRepositoryImpl from '../../../infrastructure/database/repositories/WasteSourceRepoitoryImpl';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import CreateWasteBagQrCodeUseCase from '../../../application/use-cases/waste-bag-qr-code/CreateWasteBagQrCode';

export async function createWasteBagQrCode(req: Request, res: Response): Promise<void> {
  try {
    const repo = new WasteBagQrCodeImpl();
    const useCase = new CreateWasteBagQrCodeUseCase(repo);

    const data = await useCase.execute(req.body, req.user?.user_uuid?.toString() ?? 'Admin');

    if (data === null) {
      res.fail(req.t('waste-bag-qrcode.error.NOT_FOUND'));
      return;
    } else if (typeof data === 'string') {
      res.fail(req.t(`waste-bag-qrcode.error.${data}`), { isValidationError: true });
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

export async function getWasteBagQrCodeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const entityId = req.user?.entity?.id;
    if (!entityId) {
      res.fail('entityId is required');
      return;
    }

    const repo = new WasteBagQrCodeImpl();
    const useCase = new GetWasteBagQrCode(repo);

    const data = await useCase.execute(id, entityId);

    if (data === null) {
      res.fail(req.t('waste-bag-qrcode.error.NOT_FOUND'));
      return;
    } else if (typeof data === 'string') {
      res.fail(req.t(`waste-bag-qrcode.error.${data}`), { isValidationError: true });
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

export async function getAllWasteBagQrCodes(req: Request, res: Response): Promise<void> {
  try {
    const { limit, page, entity_id, search } = req.query;
    const repo = new WasteBagQrCodeImpl();
    const useCase = new GetAllWasteBagQrCodeUseCase(repo);

    return await useCase
      .execute(
        Number(limit?.toString()),
        Number(page?.toString()),
        entity_id !== undefined ? entity_id?.toString() : req.user?.entity.id,
        search?.toString(),
      )
      .then((data) => {
        res.success(data);
      })
      .catch((error) => {
        console.error('Error retrieving Waste bag qr code:', error);
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

export async function updateWasteBagQrCode(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const repo = new WasteBagQrCodeImpl();
    const repoWasteSource = new WasteSourceRepositoryImpl();
    const repoWasteClassification = new WasteClassificationRepositoryImpl();
    const useCase = new UpdateWasteBagQrCode(repo, repoWasteSource, repoWasteClassification);

    const data = await useCase.execute({
      ...req.body,
      id: Number(id),
      healthcareFacilityId: req.user?.entity.id,
    });

    if (data === null) {
      res.fail(req.t('waste-bag-qrcode.error.NOT_FOUND'));
      return;
    } else if (typeof data === 'string') {
      res.fail(req.t(`waste-bag-qrcode.error.${data}`), { isValidationError: true });
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

export async function deleteWasteBagQrCode(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const repo = new WasteBagQrCodeImpl();
    const useCase = new DeleteHealthcareFacilityAsset(repo);

    const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
    console.log('Waste bag qr code deleted successfully(controller):', data);

    if (!data) {
      res.fail(req.t('waste-bag-qrcode.error.NOT_FOUND'));
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
