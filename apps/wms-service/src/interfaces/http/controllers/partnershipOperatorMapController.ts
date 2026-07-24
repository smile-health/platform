import { Request, Response } from 'express';
import PartnershipOperatorMapImpl from '../../../infrastructure/database/repositories/PartnershipOperatorMapRepoitoryImpl';
import CreatePartnershipOperatorMap from '../../../application/use-cases/partnership-operator-map/CreatePartnershipOperatorMap';
import GetPartnershipOperatorMap from '../../../application/use-cases/partnership-operator-map/GetPartnershipOperatorMap';
import DeletePartnershipOperatorMapUseCase from '../../../application/use-cases/partnership-operator-map/DeletePartnershipOperatorMap';
import UpdatePartnershipOperatorMapUseCase from '../../../application/use-cases/partnership-operator-map/UpdatePartnershipOperatorMap';
import PartnershipRepositoryImpl from '../../../infrastructure/database/repositories/PartnershipRepositoryImpl';
import GetPartnershipOperatorMapsByThirdpartyAdminUseCase from '../../../application/use-cases/partnership-operator-map/GetPartnershipOperatorMapsByThirdpartyAdmin';
import GetOperatorsFromOperatorMapUseCase from '../../../application/use-cases/partnership-operator-map/GetOperatorsFromOperatorMap';

export async function createPartnershipOperatorMap(req: Request, res: Response): Promise<void> {
    try {
        const repo = new PartnershipOperatorMapImpl();
        const repoPartnership = new PartnershipRepositoryImpl();
        const useCase = new CreatePartnershipOperatorMap(repo, repoPartnership);
        const data = await useCase.execute({
            ...req.body,
        });

        if (typeof data === 'string') {
            res.fail(data, { isValidationError: true });
            return;
        } else {
            console.log('Partnership Operator created successfully(controller):', data);
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAllPartnershipOperatorMaps(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, providerId, search } = req.query;
        const repo = new PartnershipOperatorMapImpl();
        const useCase = new GetPartnershipOperatorMap(repo);

        if (!providerId) {
            res.fail('providerId parameter is required');
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

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                token,
                Number(providerId?.toString()),
                search?.toString() ?? req.user?.entity.id.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste source:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAllPartnershipOperatorMapsByThirdpartyAdmin(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, search, operatorId } = req.query;
        const repo = new PartnershipOperatorMapImpl();
        const useCase = new GetPartnershipOperatorMapsByThirdpartyAdminUseCase(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                token.toString(),
                req.user?.entity.id.toString(),
                operatorId?.toString(),
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste source:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function updatePartnershipOperatorMap(req: Request, res: Response): Promise<void> {
    try {
        const { partnership_id, operator_id } = req.query;
        const { partnershipId, operatorId } = req.body;

        if (!partnership_id || !operator_id) {
            res.fail('partnership_id and operator_id parameter is required');
            return;
        }

        const repo = new PartnershipOperatorMapImpl();
        const useCase = new UpdatePartnershipOperatorMapUseCase(repo);

        const data = await useCase.execute(
            Number(partnership_id?.toString()),
            operator_id?.toString(),
            partnershipId,
            operatorId,
        );

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
            res.error(req.t("common.server-error"));
        }
    }
}

export async function deletePartnershipOperatorMap(req: Request, res: Response): Promise<void> {
    try {
        const { partnership_id, operator_id } = req.query;

        console.log(partnership_id, operator_id);

        if (!partnership_id || !operator_id) {
            res.fail('partnership_id and operator_id parameter is required');
            return;
        }

        const repo = new PartnershipOperatorMapImpl();
        const useCase = new DeletePartnershipOperatorMapUseCase(repo);

        const data = await useCase.execute(
            Number(partnership_id?.toString()),
            operator_id?.toString(),
            req.user?.id,
        );

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
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getOperatorsFromOperatorMap(req: Request, res: Response): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new PartnershipOperatorMapImpl();
        const useCase = new GetOperatorsFromOperatorMapUseCase(repo);

        await useCase
            .execute(token, req.user?.entity.id)
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Partnerships:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
