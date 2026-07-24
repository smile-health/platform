import { Request, Response } from 'express';
import UserFcmTokenRepositoryImpl from '../../../infrastructure/database/repositories/UserFcmTokenRepositoryImpl';
import GetUserFcmTokenUseCase from '../../../application/use-cases/user-fcm-token/GetByIdentity';
import CreateOrUpdateUserFcmTokenUseCase from '../../../application/use-cases/user-fcm-token/CreateOrUpdate';

export async function getOneByIdentity(req: Request, res: Response): Promise<void> {
    try {
        const { id, entityId } = req.query;

        if (!id || !entityId) {
            res.error('ID and entity ID are required to get a user FCM token');
            return;
        }

        const repo = new UserFcmTokenRepositoryImpl();
        const useCase = new GetUserFcmTokenUseCase(repo);

        return await useCase
            .execute(id?.toString(), Number(entityId?.toString()))
            .then((data) => {
                if (!data) {
                    res.error('User FCM token not found');
                    return;
                }
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving User Role:', error);
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

export async function createOrUpdateFcmToken(req: Request, res: Response): Promise<void> {
    try {
        const repo = new UserFcmTokenRepositoryImpl();
        const useCase = new CreateOrUpdateUserFcmTokenUseCase(repo);

        const { token } = req.params;

        await useCase
            .execute({
                userId: Number(req.user?.id),
                entityId: Number(req.user?.entity.id),
                userUuid: req.user?.user_uuid as string,
                token: token,
            })
            .then((result) => {
                res.success(result);
            })
            .catch((error) => {
                console.error('Error creating or updating FCM token:', error);
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
