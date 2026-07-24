import { Request, Response } from 'express';
import HealthcareFacilityAssetImpl from '../../../infrastructure/database/repositories/HealthcareFacilityAssetImpl';
import GetHealthcareFacilityAsset from '../../../application/use-cases/healthcare-facility-asset/GetHealthcareFacilityAsset';

import HealthcareAssetImpl from '../../../infrastructure/database/repositories/HealthcareAssetImpl';
import CreateHealthcareUseCase from '../../../application/use-cases/healthcare-asset/CreateHealthcareAsset';
import GetHealthcareAssetById from '../../../application/use-cases/healthcare-asset/GetHealthcareAsset';
import UpdateHealthcareAssetUseCase from '../../../application/use-cases/healthcare-asset/UpdateHealthcareAsset';
import GetActiveHealthcareWasteScaleAssetsUseCase from '../../../application/use-cases/healthcare-asset/GetActiveHealthcareWasteScaleAssets';

export async function createHealthcareAsset(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];
    const repo = new HealthcareAssetImpl();
    const useCase = new CreateHealthcareUseCase(repo);

    const data = await useCase.execute(token, req.body);

    if (typeof data === 'string') {
      res.fail(data, { isValidationError: true });
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

export async function getHealthcareAssetById(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const repo = new HealthcareAssetImpl();
    const useCase = new GetHealthcareAssetById(repo);

    const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
    const lang = acceptLanguage.includes('en') ? 'en' : 'id';

    // Ambil dari query param atau body (sesuaikan kebutuhan)
    const healthcareFacilityIdParam =
      req.query.healthcareFacilityId || req.body?.healthcareFacilityId;

    // Default ke entity_id jika tidak dikirim
    const healthcareFacilityId = healthcareFacilityIdParam
      ? parseInt(healthcareFacilityIdParam as string)
      : req.user?.entity_id;

    if (!healthcareFacilityId) {
      res.fail('healthcareFacilityId or entityId required', {
        isValidationError: true,
      });
      return;
    }

    const data = await useCase.execute(parseInt(req.params.id), token, healthcareFacilityId, lang);

    if (data === null) {
      res.fail('Healthcare Asset not found');
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

export async function getActiveHealthcareWasteScaleAssets(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];
    const repo = new HealthcareAssetImpl();
    const useCase = new GetActiveHealthcareWasteScaleAssetsUseCase(repo);

    const data = await useCase.execute(Number(req.user?.entity_id), token);

    if (data === null) {
      res.fail('Healthcare Asset not found');
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

export async function updateHealthcareAsset(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const repo = new HealthcareAssetImpl();
    const useCase = new UpdateHealthcareAssetUseCase(repo);

    const data = await useCase.execute(token, {
      ...req.body,
      id: Number(id),
    });

    if (data === null) {
      res.fail('HealthcareFacilityAsset not found');
      return;
    } else if (typeof data === 'string') {
      res.fail(req.t(`healthcare-asset.error.${data}`), { isValidationError: true });
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
