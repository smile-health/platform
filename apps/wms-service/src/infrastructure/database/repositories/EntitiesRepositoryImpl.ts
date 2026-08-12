import { Op } from 'sequelize';
import Entities from '../../../domain/entities/Entities';
import EntitiesRepository from '../../../domain/repositories/EntitiesRepository';
import EntitiesModel from '../models/EntitiesModel';
import HealthcareAssetModel from '../models/HealthcareAssetModel';
import { sequelize } from '../db.connection';

export default class EntitiesRepositoryImpl implements EntitiesRepository {
  async getEntityId(entityId: number): Promise<Entities | null> {
    try {
      const data = await EntitiesModel.findOne({
        where: {
          id: entityId,
        },
      });

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error retrieving entities:', error);
      throw new Error('Error retrieving entities');
    }
  }

  async updateEntity(entityId: number, data: Entities): Promise<Entities | null> {
    try {
      const dataEntities = await EntitiesModel.findOne({
        where: {
          id: entityId,
        },
      });

      if (!dataEntities) {
        console.error(`Entities with ID ${entityId} not found`);
        return null;
      }

      const updateModelObj = {
        updated_at: new Date(),
        nib: data.nib,
        mobile_phone: data.mobile_phone,
        head_name: data.head_name,
        email: data.email,
        gender: data.gender,
        total_bad_room: data.total_bad_room,
        percentage_bad_room: data.percentage_bad_room,
      };

      await EntitiesModel.update(updateModelObj, {
        where: { id: entityId },
      });
      console.log('Entities updated successfully');
      return data;
    } catch (error) {
      console.error('Error retrieving entities:', error);
      throw new Error('Error retrieving entities');
    }
  }

  async getAllEntities(
    limit?: number,
    page?: number,
    entityTypeId?: number,
    entityId?: number,
    groupBy?: string[],
    attributes?: string[],
    search?: string,
    provinceId?: number,
    regencyId?: number,
    isActive?: boolean,
  ) {
    try {
      const whereClause: Record<string, any> = {};

      if (entityTypeId) {
        whereClause.entity_type_id = entityTypeId;
      }

      if (entityId) {
        whereClause.id = entityId;
      }

      if (provinceId) {
        whereClause.province_id = provinceId;
      }

      if (regencyId) {
        whereClause.regency_id = regencyId;
      }

      if (isActive !== undefined) {
        whereClause.is_active = isActive;
      }

      if (search && search.trim() !== '') {
        whereClause.name = { [Op.like]: `%${search.trim()}%` };
      }

      const safeLimit = limit && limit > 0 ? limit : 10;
      const safePage = page && page > 0 ? page : 1;
      const offset = (safePage - 1) * safeLimit;

      const queryOptions: Record<string, any> = {
        subQuery:
          (attributes && attributes.length > 0) || (groupBy && groupBy.length > 0)
            ? undefined
            : false,
        include:
          (attributes && attributes.length > 0) || (groupBy && groupBy.length > 0)
            ? undefined
            : [
                {
                  model: HealthcareAssetModel,
                  as: 'healthcareAssets',
                  attributes: [],
                  required: false,
                },
              ],
        attributes:
          attributes && attributes.length > 0
            ? attributes
            : {
                include: [
                  [
                    sequelize.fn('COUNT', sequelize.literal('`healthcareAssets`.`asset_id`')),
                    'count_dongle',
                  ],
                ],
              },
        group: groupBy && groupBy.length > 0 ? groupBy : ['EntitiesModel.id'],
        where: whereClause,
        limit: safeLimit,
        offset,
      };

      let totalCount: number;

      if (groupBy && groupBy.length > 0) {
        const countResult = await EntitiesModel.count({
          where: whereClause,
          group: groupBy,
        });
        totalCount = Array.isArray(countResult) ? countResult.length : Number(countResult) || 0;
      } else {
        totalCount = await EntitiesModel.count({ where: whereClause });
      }

      const entities = await EntitiesModel.findAll(queryOptions);

      const plainData = entities.map((e) =>
        typeof e.get === 'function' ? e.get({ plain: true }) : e,
      );

      return {
        data: plainData,
        pagination: {
          total: totalCount,
          pages: Math.ceil(totalCount / safeLimit),
          currentPage: safePage,
          perPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error fetching entities:', error);
      throw new Error('Failed to fetch entities');
    }
  }

  async updateStatusActiveEntities(entityId: number, isActive: boolean): Promise<Entities | null> {
    try {
      const dataUsers = await EntitiesModel.findOne({
        where: {
          id: entityId,
        },
      });

      if (!dataUsers) {
        console.error(`Entities with ID ${entityId} not found`);
        return null;
      }

      const updateModelObj = {
        is_active: isActive,
      };

      await EntitiesModel.update(updateModelObj, {
        where: { id: entityId },
      });

      const data = await EntitiesModel.findOne({
        where: {
          id: entityId,
        },
      });
      console.log('Entities updated successfully');
      return data;
    } catch (error) {
      console.error('Error retrieving Entities:', error);
      throw new Error('Error retrieving Entities');
    }
  }
}
