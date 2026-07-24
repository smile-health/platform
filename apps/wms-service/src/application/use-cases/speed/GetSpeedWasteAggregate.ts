import SpeedWasteRepository, { SpeedWasteAggregate } from '../../../domain/repositories/SpeedWasteRepository';
import { GetSpeedWasteAggregateDTO } from '../../dtos/GetSpeedWasteAggregateDTO';

export default class GetSpeedWasteAggregate {
    constructor(private readonly repo: SpeedWasteRepository) {}

    async execute(data: GetSpeedWasteAggregateDTO): Promise<SpeedWasteAggregate> {
        try {
            return await this.repo.getAggregate(data.startDate, data.endDate, data.entityId, data.nib);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
