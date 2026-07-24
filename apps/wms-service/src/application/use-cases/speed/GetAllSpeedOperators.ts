import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { GetAllSpeedOperatorsDTO } from '../../dtos/GetAllSpeedOperatorsDTO';

export interface SpeedOperatorListResponse {
    id_operator: string;
    nama: string | null;
    email: string | null;
}

export default class GetAllSpeedOperators {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: GetAllSpeedOperatorsDTO): Promise<SpeedOperatorListResponse[]> {
        try {
            const operators = await this.repo.getAllOperators({
                entityId: data.entityId,
                nib: data.nib,
                role: data.role,
            });

            return operators.map((operator) => ({
                id_operator: operator.id,
                nama: operator.name,
                email: operator.email,
            }));
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
