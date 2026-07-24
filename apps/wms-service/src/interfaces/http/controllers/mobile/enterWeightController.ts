import { Request, Response } from 'express';
import WasteBagRepositoryImpl from '../../../../infrastructure/database/repositories/WasteBagRepositoryImpl';
import WasteStatusUpdatePublisher from '../../../../infrastructure/queue/rabbitmq/publishers/WasteStatusUpdatePublisher';
import WasteClassificationRepositoryImpl from '../../../../infrastructure/database/repositories/WasteClassificationRepositoryImpl';
import CreateWasteUseCase from '../../../../application/use-cases/CreateWaste';
import CreateWasteDTO from '../../../../application/dtos/CreateWasteDTO';

export async function createWasteController(req: Request, res: Response) {
    try {
        const repo = new WasteBagRepositoryImpl();
        const wasteStatusUpdateRepo = new WasteStatusUpdatePublisher();
        const wasteClassification = new WasteClassificationRepositoryImpl();
        const useCase = new CreateWasteUseCase(repo, wasteStatusUpdateRepo, wasteClassification);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const scaleMethod = req.body.scaleMethod === 'manual' ? 'MANUAL' : 'IOT';

        const iotMethod = req.body.scaleMethod === 'internet'
            ? 'INTERNET'
            : req.body.scaleMethod === 'bluetooth'
            ? 'BLUETOOTH'
            : undefined;

        const payload: CreateWasteDTO = {
            ...req.body,
            wasteGroupIds: req.body.sourceTreatmentGroupIds ?? req.body.wasteGroupIds,
            scaleMethod: scaleMethod,
            iotMethod: scaleMethod === 'IOT' ? iotMethod : undefined,
            weightInKgs: req.body.weight,
            wasteBagQrCodeId: req.body.qrCode,
            healthcareFacilityId: req.user?.entity.id,
            createdBy: req.user?.user_uuid,
            updatedBy: req.user?.user_uuid,
            user: {
                id: req.user?.id as number,
                email: req.user?.email as string,
                mobile_phone: req.user?.mobile_phone as string,
                fcm_token: req.user?.fcm_token as string,
                entity_id: req.user?.entity.id as number,
                province_id: Number(req.user?.entity.province_id),
                regency_id: Number(req.user?.entity.regency_id),
            },
            entity: {
                id: req.user?.entity.id as number,
                province_id: Number(req.user?.entity.province_id),
                regency_id: Number(req.user?.entity.regency_id),
            },
        };

        const isRadioActive = req.body?.isRadioActive === true ? true : false

        const wasteBag = await useCase.execute(token, payload, isRadioActive);

        if (typeof wasteBag === 'string') {
            res.fail(req.t(`waste.error.${wasteBag}`), {
                message: req.t(`waste.error.${wasteBag}`),
            });
            return;
        }
        res.success(wasteBag);
    } catch (error) {
        console.error(error);
        if (error instanceof Error || typeof error === 'string') {
            res.error(error);
        } else {
            res.error(req.t('common.server-error'));
        }
    }
}
