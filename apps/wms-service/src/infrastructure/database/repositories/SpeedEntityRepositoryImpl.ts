import { Op } from 'sequelize';
import Entities from '../../../domain/entities/Entities';
import SpeedEntityRepository, { SpeedEntityListFilter } from '../../../domain/repositories/SpeedEntityRepository';
import EntitiesModel from '../models/EntitiesModel';
import { checkExistingDataWithColumn } from '../../../shared/utils/checkExistingData';
import { paginationUtils } from '../../../shared/utils/pagination';

export default class SpeedEntityRepositoryImpl implements SpeedEntityRepository {
    async getAllEntities(filter: SpeedEntityListFilter) {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit: filter.limit,
                page: filter.page,
            });

            const where: Record<string, any> = {};
            if (filter.search && filter.search.trim() !== '') {
                const term = `%${filter.search.trim()}%`;
                where[Op.or as any] = [
                    { name: { [Op.like]: term } },
                    { nib: { [Op.like]: term } },
                    { address: { [Op.like]: term } },
                ];
            }
            if (filter.entityTypeId !== undefined) where.entity_type_id = filter.entityTypeId;
            if (filter.provinceId !== undefined) where.province_id = filter.provinceId;
            if (filter.regencyId !== undefined) where.regency_id = filter.regencyId;
            if (filter.subDistrictId !== undefined) where.sub_district_id = filter.subDistrictId;
            if (filter.villageId !== undefined) where.village_id = filter.villageId;
            if (filter.idSatuSehat !== undefined) where.id_satu_sehat = filter.idSatuSehat;
            if (filter.nib) where.nib = filter.nib;

            const { count, rows } = await EntitiesModel.findAndCountAll({
                where,
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['id', 'ASC']],
            });

            return paginationUtils.formatPaginationResult(
                rows.map((row) => new Entities(row.get({ plain: true }))),
                count,
                safeLimit,
                safePage,
            );
        } catch (error) {
            throw new Error(
                error instanceof Error ? `Error fetching SPEED entities: ${error.message}` : 'Unknown error occurred while fetching SPEED entities',
            );
        }
    }

    async getEntityByNib(nib: string): Promise<Entities | null> {
        try {
            const existing = await checkExistingDataWithColumn(EntitiesModel, nib, 'nib');
            if (!existing) return null;
            return new Entities(existing.get({ plain: true }));
        } catch (error) {
            throw new Error(
                error instanceof Error ? `Error fetching SPEED entity by NIB: ${error.message}` : 'Unknown error occurred while fetching SPEED entity by NIB',
            );
        }
    }
}
