import SpeedEntityRepository from '../../../domain/repositories/SpeedEntityRepository';
import { GetAllSpeedEntitiesDTO } from '../../dtos/GetAllSpeedEntitiesDTO';
import { mapEntityToSpeedResponse, SpeedEntityResponse } from './mapEntityToSpeedResponse';

export default class GetAllSpeedEntities {
    constructor(private readonly repo: SpeedEntityRepository) {}

    async execute(data: GetAllSpeedEntitiesDTO): Promise<{
        data: SpeedEntityResponse[];
        pagination: { total: number; pages: number; currentPage: number; perPage: number };
    }> {
        try {
            const result = await this.repo.getAllEntities({
                limit: data.limit ?? 10,
                page: data.page ?? 1,
                search: data.search,
                entityTypeId: data.entityTypeId,
                provinceId: data.provinceId,
                regencyId: data.regencyId,
                subDistrictId: data.subDistrictId,
                villageId: data.villageId,
                idSatuSehat: data.idSatuSehat,
                nib: data.nib,
            });
            return {
                data: result.data.map(mapEntityToSpeedResponse),
                pagination: result.pagination,
            };
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : String(error));
        }
    }
}
