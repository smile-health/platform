import { Request, Response } from 'express';
import DisposalRepositoryImpl from '../../../../infrastructure/database/repositories/DisposalRepositoryImpl';
import GetAllDisposalUseCase from '../../../../application/use-cases/bast-disposal/GetAllDisposalUseCase';

export async function getAllDisposalUseCaseController(req: Request, res: Response): Promise<void> {
    try {
        const { limit, page, healthcareFacilityId, search } = req.query;

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
        const useCase = new GetAllDisposalUseCase(repo);

        await useCase
            .execute(
                Number(limit?.toString()),
                Number(page?.toString()),
                Number(resolvedHealthcareId?.toString()),
                search?.toString(),
                'APPROVED',
                false,
            )
            .then((data) => {
                res.success(data);
            })
            .catch((error) => {
                console.error('Error retrieving disposal:', error);
                if (error instanceof Error || typeof error === 'string') {
                    res.error(error);
                } else {
                    res.error(req.t("common.server-error"));
                }
            });
    } catch (error) {
        console.error('Error in reportWasteBagController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}
