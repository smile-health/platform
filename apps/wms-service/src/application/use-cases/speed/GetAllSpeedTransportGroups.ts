import SpeedHandoverRepository from '../../../domain/repositories/SpeedHandoverRepository';
import { GetAllSpeedTransportGroupsDTO } from '../../dtos/GetAllSpeedTransportGroupsDTO';
import {
    mapTransportGroupToSpeedResponse,
    SpeedGrupPengangkutanResponse,
} from './mapTransportGroupToSpeedResponse';

export default class GetAllSpeedTransportGroups {
    constructor(private readonly repo: SpeedHandoverRepository) {}

    async execute(data: GetAllSpeedTransportGroupsDTO): Promise<{
        data: SpeedGrupPengangkutanResponse[];
        pagination: { total: number; pages: number; currentPage: number; perPage: number };
    }> {
        try {
            const result = await this.repo.getAllTransportGroups({
                limit: data.limit ?? 10,
                page: data.page ?? 1,
                entityId: data.entityId,
                nib: data.nib,
                wasteStatus: data.wasteStatus ?? 'READY_FOR_TRANSPORT',
                startDate: data.startDate,
                endDate: data.endDate,
            });

            return {
                data: result.data.map((group) => mapTransportGroupToSpeedResponse(group, false)),
                pagination: result.pagination,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
