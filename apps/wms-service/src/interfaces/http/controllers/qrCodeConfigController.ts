import { Request, Response } from 'express';
import QrCodeConfigImpl from '../../../infrastructure/database/repositories/QrCodeConfigRepoitoryImpl';
import CreateQrCodeConfig from '../../../application/use-cases/qr-code-config/CreateQrCodeConfig';
import GetQrCodeConfig from '../../../application/use-cases/qr-code-config/GetQrCodeConfig';
import UpdateQrCodeConfig from '../../../application/use-cases/qr-code-config/UpdateQrCodeConfig';
import DeleteHealthcareFacilityAsset from '../../../application/use-cases/qr-code-config/DeleteQrCodeConfig';
import GetAllQrCodeConfigUseCase from '../../../application/use-cases/qr-code-config/GetAllQrCodeConfig';
import WasteSourceRepositoryImpl from '../../../infrastructure/database/repositories/WasteSourceRepoitoryImpl';
import WasteClassificationRepositoryImpl from '../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';

export async function createQrCodeConfig(req: Request, res: Response): Promise<void> {
    try {
        const repo = new QrCodeConfigImpl();
        const repoWasteSource = new WasteSourceRepositoryImpl();
        const useCase = new CreateQrCodeConfig(repo, repoWasteSource);

        const data = await useCase.execute({
            ...req.body,
            healthcareFacilityId: req.user?.entity.id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
        });
        console.log('Qr Code Config created successfully(controller):', data);
        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}

export async function getQrCodeConfigById(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new QrCodeConfigImpl();
        const useCase = new GetQrCodeConfig(repo);

        const data = await useCase.execute(id);

        if (data === null) {
            res.fail('Qr Code Config not found');
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

export async function getAllQrCodeConfigs(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, entity_id, search, sourceType, sortBy, sortOrder } = req.query;
        const repo = new QrCodeConfigImpl();
        const useCase = new GetAllQrCodeConfigUseCase(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const acceptLanguage = (req.headers['accept-language'] as string)?.toLowerCase() || 'id';
        const lang = acceptLanguage.includes('en') ? 'en' : 'id';

        const validSortBy =
            sortBy === 'wasteCharacteristicsName' ||
            sortBy === 'wasteSourceName' ||
            sortBy === 'updatedAt' ||
            sortBy === 'updated_at'
                ? (sortBy as 'wasteCharacteristicsName' | 'wasteSourceName' | 'updatedAt' | 'updated_at')
                : 'updated_at';

        const validSortOrder =
            sortOrder === 'ASC' || sortOrder === 'DESC' ? (sortOrder as 'ASC' | 'DESC') : 'ASC';

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                token,
                lang,
                entity_id !== undefined ? entity_id?.toString() : req.user?.entity.id,
                search?.toString(),
                sourceType?.toString(),
                validSortBy,
                validSortOrder,
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Qr Code Config:', error);
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

export async function updateQrCodeConfig(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new QrCodeConfigImpl();
        const repoWasteSource = new WasteSourceRepositoryImpl();
        const repoWasteClassification = new WasteClassificationRepositoryImpl();
        const useCase = new UpdateQrCodeConfig(repo, repoWasteSource, repoWasteClassification);

        const data = await useCase.execute({
            ...req.body,
            id: Number(id),
            healthcareFacilityId: req.user?.entity.id,
            updatedBy: req.user?.user_uuid,
        });

        if (data === null) {
            res.fail('Qr Code Config not found');
            return;
        } else if (typeof data === 'string') {
            res.fail(data, {
                isValidationError: true,
            });
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

export async function deleteQrCodeConfig(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;

        if (!id) {
            res.fail('ID parameter is required');
            return;
        }

        const repo = new QrCodeConfigImpl();
        const useCase = new DeleteHealthcareFacilityAsset(repo);

        const data = await useCase.execute({ id: Number(id), deletedBy: req.user?.id });
        console.log('Qr Code Config deleted successfully(controller):', data);

        if (!data) {
            res.fail('Qr Code Config not found');
            return;
        }

        res.success(data);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t("common.server-error"));
        }
    }
}
