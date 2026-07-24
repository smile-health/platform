import { Request, Response } from 'express';
import CreateDisposalUseCase from '../../../application/use-cases/bast-disposal/CreateBast';
import DisposalRepositoryImpl from '../../../infrastructure/database/repositories/DisposalRepositoryImpl';
import { NotificationPublisher } from '../../../infrastructure/queue/rabbitmq/publishers/NotificationPublisher';
import ConfirmDisposalUseCase from '../../../application/use-cases/bast-disposal/ConfirmBast';
import GetAllDisposalUseCase from '../../../application/use-cases/bast-disposal/GetAllDisposalUseCase';
import { parseBoolean } from '../../../shared/utils/parseBoolean';
import GetDisposalUseCase from '../../../application/use-cases/bast-disposal/GetDisposal';

export async function confirmationBastNumber(req: Request, res: Response): Promise<void> {
    try {
        const repo = new DisposalRepositoryImpl();
        const useCase = new ConfirmDisposalUseCase(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];
        return useCase
            .execute(
                req.body.bastNo,
                req.body.status,
                req.user?.user_uuid as string,
                token,
                req.body.reason,
            )
            .then((data) => {
                if (!data) {
                    res.fail('Update disposal bast number failed');
                    return;
                }

                res.success(data);
            });
    } catch (error) {
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function createDispose(req: Request, res: Response): Promise<void> {
    try {
        const repo = new DisposalRepositoryImpl();
        const notif = new NotificationPublisher();
        const useCase = new CreateDisposalUseCase(repo, notif);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const result = await useCase.execute(
            { ...req.body },
            {
                id: req.user?.id as number,
                email: req.user?.email as string,
                mobile_phone: req.user?.mobile_phone as string,
                fcm_token: req.user?.fcm_token as string,
                entity_id: req.user?.entity.id as number,
                province_id: Number(req.user?.entity.province_id),
                regency_id: Number(req.user?.entity.regency_id),
            },
            token,
        );

        if (result === null) {
            res.fail('Creating disposed failed');
            return;
        } else if (typeof result === 'string') {
            res.fail(result);
            return;
        }

        res.success(result);
    } catch (error) {
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getAllDisposalController(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, healthcareFacilityId, search, status, isRead, bast_no } = req.query;

        const roles = Array.isArray(req.user?.external_roles) ? req.user.external_roles : [];
        const isSuperAdmin = roles.includes('super_admin');

        let entityId = req.user?.entity.id;
        let entityType = req.user?.entity.entity_type.name;

        let resolvedHealthcareId = healthcareFacilityId;

        const allowedTypes = ['healthcare_facility', 'regency', 'province', 'central'];
        if (entityId && allowedTypes.includes(entityType) && !isSuperAdmin) {
            resolvedHealthcareId = req.user?.entity.id.toString();
        }

        const repo = new DisposalRepositoryImpl();

        if (bast_no) {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.fail(req.t('common.missing-token'), {
                    isValidationError: true,
                });
                return;
            }

            const token = authHeader.split(' ')[1];
            const useCase = new GetDisposalUseCase(repo);

            try {
                const data = await useCase.execute(bast_no.toString(), token);
                res.success(data);
            } catch (error) {
                console.error('Error retrieving disposal by BAST:', error);
                res.error(error instanceof Error ? error.message : req.t('common.server-error'));
            }

            return;
        }

        const useCase = new GetAllDisposalUseCase(repo);

        let isReadBool: boolean | undefined;
        if (isRead) {
            isReadBool = parseBoolean(isRead.toString());
        }

        const data = await useCase.execute(
            Number(limit?.toString()),
            Number(page?.toString()),
            Number(resolvedHealthcareId?.toString()),
            search?.toString(),
            status?.toString(),
            isReadBool
        );

        res.success(data);

    } catch (error) {
        console.error('Unexpected error:', error);
        res.error(error instanceof Error ? error.message : req.t('common.server-error'));
    }
}

export async function getDisposal(req: Request, res: Response): Promise<void> {
    try {
        const { bast_no } = req.params;
        if (!bast_no) {
            res.fail('bast_no parameter is required');
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

        const repo = new DisposalRepositoryImpl();
        const useCase = new GetDisposalUseCase(repo);

        const data = await useCase.execute(bast_no, token);

        if (data === null) {
            res.fail('Disposal not found');
            return;
        } else {
            res.success(data);
        }
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error('Internal Server Error');
        }
    }
}
