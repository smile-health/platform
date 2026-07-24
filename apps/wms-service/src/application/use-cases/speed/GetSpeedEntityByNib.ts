import SpeedEntityRepository from '../../../domain/repositories/SpeedEntityRepository';
import { GetSpeedEntityByNibDTO } from '../../dtos/GetSpeedEntityByNibDTO';
import { mapEntityToSpeedResponse, SpeedEntityResponse } from './mapEntityToSpeedResponse';

export default class GetSpeedEntityByNib {
    constructor(private readonly repo: SpeedEntityRepository) {}

    async execute(data: GetSpeedEntityByNibDTO): Promise<SpeedEntityResponse | null> {
        try {
            const entity = await this.repo.getEntityByNib(data.nib);
            if (!entity) return null;
            return mapEntityToSpeedResponse(entity);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
