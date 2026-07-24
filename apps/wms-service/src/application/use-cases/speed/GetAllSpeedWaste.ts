import SpeedWasteRepository from '../../../domain/repositories/SpeedWasteRepository';
import { GetAllSpeedWasteDTO } from '../../dtos/GetAllSpeedWasteDTO';
import { mapWasteToSpeedResponse, SpeedWasteResponse } from './mapWasteToSpeedResponse';

export default class GetAllSpeedWaste {
    constructor(private readonly repo: SpeedWasteRepository) {}

    async execute(data: GetAllSpeedWasteDTO): Promise<{
        data: SpeedWasteResponse[];
        pagination: { total: number; pages: number; currentPage: number; perPage: number };
    }> {
        try {
            const result = await this.repo.getAllWaste({
                limit: data.limit ?? 10,
                page: data.page ?? 1,
                id: data.id,
                entityId: data.entityId,
                nib: data.nib,
                transporterId: data.transporterId,
                thirdPartyId: data.thirdPartyId,
                wasteClassificationId: data.wasteClassificationId,
                ownedBy: data.ownedBy,
                wasteStatus: data.wasteStatus,
                wasteBagCode: data.wasteBagCode,
                wasteTypeId: data.wasteTypeId,
                wasteGroupId: data.wasteGroupId,
                wasteCharacteristicsId: data.wasteCharacteristicsId,
            });

            return {
                data: result.data.map((waste) => mapWasteToSpeedResponse(waste, false)),
                pagination: result.pagination,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
