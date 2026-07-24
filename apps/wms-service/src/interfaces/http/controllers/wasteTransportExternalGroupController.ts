import { Request, Response } from 'express';
import WasteTransportExternalGroupImpl from '../../../infrastructure/database/repositories/WasteBagTransportExternalGroupImpl';
import GetAllWasteTransportExternalGroupUseCase from '../../../application/use-cases/waste-transport-external-group/GetAllUseCase';
import GetWasteTransportExternalGroupUseCase from '../../../application/use-cases/waste-transport-external-group/GetById';

export async function getAllWasteTransportExternalGroup(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, treatmentMethod, startDate, endDate, entityId, healthcareFacilityId } = req.query;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new WasteTransportExternalGroupImpl();
        const useCase = new GetAllWasteTransportExternalGroupUseCase(repo);

        type AllowedStatus =
            | 'IN_TEMPORARY_STORAGE'
            | 'IN_COLD_STORAGE'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT'
            | 'READY_FOR_TREATMENT'
            | 'RECYCLED'
            | 'LANDFILLED'
            | 'COLLECTED'
            | 'DISPOSED';

        type AllowedTreatmentMethod =
            | 'TRANSPORTER_LANDFILL'
            | 'TRANSPORTER_RECYCLER'
            | 'TRANSPORTER_TREATMENT';

        type AllowedTransportationStatus =
            | 'READY_FOR_TRANSPORT'
            | 'TRANSPORTATION_REQUEST_CREATED'
            | 'IN_TRANSIT';

        const allAllowedStatuses: AllowedStatus[] = [
            'IN_TEMPORARY_STORAGE',
            'IN_COLD_STORAGE',
            'INCINERATION_IN_PROCESS',
            'STERILIZATION_IN_PROCESS',
            'INCINERATED',
            'STERILISED',
            'READY_FOR_TRANSPORT',
            'TRANSPORTATION_REQUEST_CREATED',
            'IN_TRANSIT',
            'READY_FOR_TREATMENT',
            'RECYCLED',
            'LANDFILLED',
            'COLLECTED',
            'DISPOSED',
        ];

        const allowedExternalTreatment = [
            'TRANSPORTER_LANDFILL',
            'TRANSPORTER_RECYCLER',
            'TRANSPORTER_TREATMENT',
            'TRANSPORTER_GOVERNMENT',
            'TRANSPORTER_GOVERNMENT_WASTE_BANK',
            'SPECIALIZED_TREATMENT_PROVIDER',
        ];

        const allowedTransportationStatuses: AllowedTransportationStatus[] = [
            'READY_FOR_TRANSPORT',
            'TRANSPORTATION_REQUEST_CREATED',
            'IN_TRANSIT',
        ];

        const statusParam = req.query.status;
        const anotherStatusParam = req.query.anotherStatus;
        const externalTreatmentParam = req.query.externalTreatment;
        const transportationStatusParam = req.query.transportationStatus;
        let status: AllowedStatus | undefined;
        let anotherStatus: AllowedStatus | undefined;
        let treatment: AllowedTreatmentMethod | undefined;
        let transportationStatus: AllowedTransportationStatus | undefined;

        if (
            typeof statusParam === 'string' &&
            allAllowedStatuses.includes(statusParam as AllowedStatus)
        ) {
            status = statusParam as AllowedStatus;
        }

        if (
            typeof anotherStatusParam === 'string' &&
            allAllowedStatuses.includes(anotherStatusParam as AllowedStatus)
        ) {
            anotherStatus = anotherStatusParam as AllowedStatus;
        }

        if (
            typeof externalTreatmentParam === 'string' &&
            allowedExternalTreatment.includes(externalTreatmentParam as AllowedTreatmentMethod)
        ) {
            treatment = externalTreatmentParam as AllowedTreatmentMethod;
        }

        if (
            typeof transportationStatusParam === 'string' &&
            allowedTransportationStatuses.includes(
                transportationStatusParam as AllowedTransportationStatus,
            )
        ) {
            transportationStatus = transportationStatusParam as AllowedTransportationStatus;
        }

        return await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                token,
                req.user?.external_properties?.role.type ?? undefined,
                entityId ? Number(entityId?.toString()) : req.user?.entity.id,
                startDate ? new Date(startDate.toString()) : new Date(),
                endDate ? new Date(endDate.toString()) : new Date(),
                status,
                anotherStatus,
                treatment,
                treatmentMethod?.toString(),
                healthcareFacilityId ? Number(healthcareFacilityId?.toString()) : undefined,
                transportationStatus,
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste bag treatment group:', error);
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

export async function getWasteTransportExternalGroup(req: Request, res: Response): Promise<void> {
    try {
        const { id, qrCodeId } = req.query;

        const repo = new WasteTransportExternalGroupImpl();
        const useCase = new GetWasteTransportExternalGroupUseCase(repo);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        return await useCase
            .execute(token, Number(id?.toString()), qrCodeId?.toString())
            .then((data) => {
                if (!data) {
                    res.fail(req.t('waste.error.NOT_FOUND_WG'))
                    return;
                }
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving Waste bag treatment group:', error);
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
