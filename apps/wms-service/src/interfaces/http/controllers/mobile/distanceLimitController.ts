import { Request, Response } from 'express';
import ValidateDistanceEntityLocationUseCase from '../../../../application/use-cases/entity-location/ValidateDistanceEntityLocation';
import EntityLocationRepositoryImpl from '../../../../infrastructure/database/repositories/EntityLocationRepositoryImpl';

export async function validateDistanceLimit(req: Request, res: Response): Promise<void> {
    try {
        const { id, longitude, latitude } = req.body;

        const repo = new EntityLocationRepositoryImpl();
        const useCase = new ValidateDistanceEntityLocationUseCase(repo);

        return useCase.execute(id, longitude, latitude).then((result) => {
            if (result === null) {
                res.fail(result);
                return;
            } else if (result === null) {
                res.fail('Data location not found');
                return;
            }

            res.success(result);
        });
    } catch (error) {
        console.error('Error in followUpTreatmentListController:', error);
        res.error(error instanceof Error ? error.message : 'Unknown error occurred');
    }
}
