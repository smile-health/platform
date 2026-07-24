import { Request, Response } from 'express';
import ManualScaleRequestRepositoryImpl from '../../../infrastructure/database/repositories/ManualScaleRequestRepositoryImpl';
import CreateManualScaleRequestUseCase from '../../../application/use-cases/manual-scale-request/CreateUseCase';
import PatchManualScaleRequestUseCase from '../../../application/use-cases/manual-scale-request/PatchActivateUseCase';
import GetAllManualScaleRequestUseCase from '../../../application/use-cases/manual-scale-request/GetAllUseCase';
import ManualScaleRequestPublisher from '../../../infrastructure/queue/rabbitmq/publishers/ManualScaleRequestPublisher';
import { createManualScaleRequestSchemaBody } from '../request-schemas/manualScaleRequest.schema';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';

export async function getAllManualScaleRequest(req: Request, res: Response): Promise<void> {
  try {
    const { limit, page, entityId, status, isActive, provinceId, cityId, startDate, endDate } =
      req.query;
    const repo = new ManualScaleRequestRepositoryImpl();
    const useCase = new GetAllManualScaleRequestUseCase(repo);

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.fail(req.t('common.missing-token'), {
        isValidationError: true,
      });
      return;
    }

    const token = authHeader?.split(' ')[1];

    const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];

    const isSuperAdmin = roles.includes('super_admin');

    let entityIdParam = isSuperAdmin ? undefined : Number(req.user?.entity?.id?.toString());
    if (entityId) {
      entityIdParam = Number(entityId.toString());
    }

    return await useCase
      .execute(
        Number(limit?.toString()),
        Number(page?.toString()),
        token,
        entityIdParam,
        status?.toString(),
        isActive?.toString() === 'true',
        Number(provinceId?.toString()),
        Number(cityId?.toString()),
        startDate?.toString(),
        endDate?.toString(),
      )
      .then((data) => {
        res.success(data);
      })
      .catch((error) => {
        console.error('Error retrieving data:', error);
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

export async function createManualScaleRequest(req: Request, res: Response): Promise<void> {
  try {
    const validatedBody = createManualScaleRequestSchemaBody.parse(req.body);

    const repo = new ManualScaleRequestRepositoryImpl();
    const publisher = new ManualScaleRequestPublisher();
    const notif = new NotificationPublisher();
    const useCase = new CreateManualScaleRequestUseCase(repo, publisher, notif);

    const data = await useCase.execute({
      ...validatedBody,
      requestedBy: req.user?.user_uuid as string,
      entityId: req.user?.entity.id as number,
      user: {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
        name: [req.user?.firstname, req.user?.lastname].filter(Boolean).join(' '),
      },
      entity: {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    });

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

export async function activateManualScaleRequest(req: Request, res: Response): Promise<void> {
  try {
    type AllowedStatus = 'APPROVED' | 'REJECTED';
    const { id, status } = req.query;

    if (!id && !status) {
      res.fail('ID parameter is required');
      return;
    }

    let statusInfo;

    if (typeof status === 'string' && (status === 'APPROVED' || status === 'REJECTED')) {
      statusInfo = status as AllowedStatus;
    } else {
      throw new Error('Invalid or missing status parameter. Must be "APPROVED" or "REJECTED".');
    }

    const repo = new ManualScaleRequestRepositoryImpl();
    const notif = new NotificationPublisher();
    const useCase = new PatchManualScaleRequestUseCase(repo, notif);

    if (!req.user?.user_uuid) {
      res.fail('processedBy is null');
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

    const data = await useCase.execute(
      Number(id?.toString()),
      req.user?.user_uuid,
      statusInfo,
      token,
      {
        id: req.user?.id as number,
        email: req.user?.email as string,
        mobile_phone: req.user?.mobile_phone as string,
        fcm_token: req.user?.fcm_token as string,
        entity_id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
      {
        id: req.user?.entity.id as number,
        province_id: Number(req.user?.entity.province_id),
        regency_id: Number(req.user?.entity.regency_id),
      },
    );

    if (typeof data === 'string') {
      res.status(400).json({ status: 'error', message: data });
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
