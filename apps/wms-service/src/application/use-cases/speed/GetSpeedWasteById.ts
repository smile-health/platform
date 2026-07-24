import SpeedWasteRepository from '../../../domain/repositories/SpeedWasteRepository';
import { GetSpeedWasteByIdDTO } from '../../dtos/GetSpeedWasteByIdDTO';
import { mapWasteToSpeedResponse, SpeedWasteResponse } from './mapWasteToSpeedResponse';

export default class GetSpeedWasteById {
    constructor(private readonly repo: SpeedWasteRepository) {}

    async execute(data: GetSpeedWasteByIdDTO): Promise<SpeedWasteResponse | null> {
        try {
            const waste = await this.repo.getWasteById(data.wasteBagCode);
            if (!waste) return null;
            return mapWasteToSpeedResponse(waste, true);
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
