import { Request, Response } from 'express';
import WasteTreatmentExternalGroupImpl from '../../../infrastructure/database/repositories/WasteTreatmentExternalGroupImpl';
import GetAllWasteTreatmentExternalGroupUseCase from '../../../application/use-cases/waste-treatment-external-group/GetAllUseCase';
import GetWasteTreatmentExternalGroupUseCase from '../../../application/use-cases/waste-treatment-external-group/GetById';

export async function getAllWasteTreatmentExternalGroup(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { limit, page, startDate, endDate, entityId, healthcareFacilityId } = req.query;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.fail(req.t('common.missing-token'), {
                isValidationError: true,
            });
            return;
        }

        const token = authHeader?.split(' ')[1];

        const repo = new WasteTreatmentExternalGroupImpl();
        const useCase = new GetAllWasteTreatmentExternalGroupUseCase(repo);

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

        type Roles = 'operator_landfill' | 'operator_treatment' | 'operator_recycler' | 'operator_waste_bank';
        const allowedRoles: Roles[] = [
            'operator_landfill', 'operator_treatment', 'operator_recycler'
        ];

        type AllowedTransportationStatus =
            | 'STORED_FOR_TREATMENT'
            | 'READY_FOR_TREATMENT'
            | 'INCINERATION_IN_PROCESS'
            | 'STERILIZATION_IN_PROCESS'
            | 'INCINERATED'
            | 'STERILISED'
            | 'LANDFILLED'
            | 'RECYCLED'
            | 'DISPOSED'
            | 'COLLECTED';

        const allowedTransportationStatuses: AllowedTransportationStatus[] = [
            'STORED_FOR_TREATMENT',
            'READY_FOR_TREATMENT',
            'INCINERATION_IN_PROCESS',
            'STERILIZATION_IN_PROCESS',
            'INCINERATED',
            'STERILISED',
            'LANDFILLED',
            'RECYCLED',
            'DISPOSED',
            'COLLECTED',
        ];

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

        const statusParam = req.query.status;
        const transportationStatusParam = req.query.transportationStatus;
        let status: string | undefined;
        let roles: Roles | undefined;
        let transportationStatus: AllowedTransportationStatus | undefined;

        if (
            typeof statusParam === 'string' &&
            statusParam.split(',').map(status => {
                allAllowedStatuses.includes(status as AllowedStatus)
            })
        ) {
            status = statusParam as string;
        }

        if (
            req.user?.external_roles &&
            allowedRoles.includes(req.user?.external_roles.toString() as Roles)
        ) {
            roles = req.user?.external_properties.role.type as Roles;
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
                entityId ? Number(entityId?.toString()) : req.user?.entity.id,
                startDate ? new Date(startDate.toString()) : new Date(),
                endDate ? new Date(endDate.toString()) : new Date(),
                status,
                roles,
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

export async function getWasteTreatmentExternalGroup(req: Request, res: Response): Promise<void> {
    try {
        const { id, qrCodeId } = req.query;

        const repo = new WasteTreatmentExternalGroupImpl();
        const useCase = new GetWasteTreatmentExternalGroupUseCase(repo);

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
