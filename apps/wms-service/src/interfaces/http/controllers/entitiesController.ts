import { Request, Response } from 'express';
import EntitiesRepositoryImpl from '../../../infrastructure/database/repositories/EntitiesRepositoryImpl';
import GetEntitiesByIdUseCase from '../../../application/use-cases/entities/GetEntitiesByIdUseCase';
import UpdateEntitiesUseCase from '../../../application/use-cases/entities/UpdateEntities';
import EntitiesDTO from '../../../application/dtos/EntitiesDTO';
import GetAllEntitiesUseCase from '../../../application/use-cases/entities/GetAllEntitiesUseCase';
import UpdateStatusActiveEntitiesUseCase from '../../../application/use-cases/entities/UpdateStatusActiveEntities';
import { parseBoolean } from '../../../shared/utils/parseBoolean';

export async function getEntitiesById(req: Request, res: Response): Promise<void> {
  try {
    const { entityId } = req.query;

    let resolvedHealthcareId = entityId;
    let entity = req.user?.entity.id;

    if (!entity) {
      throw new Error('user entity are required.');
    }
    if (!entityId) {
      resolvedHealthcareId = entity.toString();
    }

    const repo = new EntitiesRepositoryImpl();
    const useCase = new GetEntitiesByIdUseCase(repo);

    const data = await useCase.execute(Number(resolvedHealthcareId));

    if (data === null) {
      res.success(null);
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

export async function updateEntities(req: Request, res: Response): Promise<void> {
  try {
    const entityId = req.user?.entity.id;

    const payload: EntitiesDTO = {
      ...req.body,
    };

    const repo = new EntitiesRepositoryImpl();
    const useCase = new UpdateEntitiesUseCase(repo);

    const data = await useCase.execute(Number(entityId), payload);

    if (data === null) {
      res.fail('Entity Settings not found');
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

export async function updateStatusEntities(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (!id) {
      res.fail('ID parameter is required');
      return;
    }

    const { is_active } = req.body;

    const repo = new EntitiesRepositoryImpl();
    const useCase = new UpdateStatusActiveEntitiesUseCase(repo);

    const data = await useCase.execute(Number(id), is_active);

    if (data === null) {
      res.fail('Users not found');
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

export async function getAllEntities(req: Request, res: Response): Promise<void> {
  try {
    const {
      entityTypeId,
      entityId,
      groupBy,
      attributes,
      limit,
      page,
      search,
      provinceId,
      regencyId,
      isActive,
    } = req.query;

    const repo = new EntitiesRepositoryImpl();
    const useCase = new GetAllEntitiesUseCase(repo);

    const parsedEntityTypeId = entityTypeId ? Number(entityTypeId.toString()) : undefined;
    const parsedEntityId = entityId ? Number(entityId.toString()) : undefined;

    const groupByArray: string[] | undefined =
      typeof groupBy === 'string'
        ? groupBy.split(',').map((s) => s.trim())
        : Array.isArray(groupBy)
          ? (groupBy as string[])
          : undefined;

    const attributesArray: string[] | undefined =
      typeof attributes === 'string'
        ? attributes.split(',').map((s) => s.trim())
        : Array.isArray(attributes)
          ? (attributes as string[])
          : undefined;
    let isReadBool: boolean | undefined;
    if (isActive) {
      isReadBool = parseBoolean(isActive.toString());
    }

    const data = await useCase.execute(
      Number(limit?.toString()),
      Number(page?.toString()),
      parsedEntityTypeId,
      parsedEntityId,
      groupByArray,
      attributesArray,
      search?.toString(),
      Number(provinceId?.toString()),
      Number(regencyId?.toString()),
      isReadBool,
    );

    if (data === null) {
      res.success('No entities found');
    } else {
      res.success(data);
    }
  } catch (error) {
    console.error('Error in getAllEntities controller:', error);
    if (error instanceof Error || typeof error === 'string') {
      res.error(error);
    } else {
      res.error(req.t ? req.t('common.server-error') : 'Internal server error');
    }
  }
}
