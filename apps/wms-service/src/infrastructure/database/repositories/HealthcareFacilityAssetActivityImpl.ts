import HealthcareFacilityAssetActivity from '../../../domain/entities/HealthcareFacilityAssetActivity';
import { paginationUtils } from '../../../shared/utils/pagination';
import { QueryTypes, UniqueConstraintError } from 'sequelize';
import HealthcareFacilityAssetActivityModel, {
    HealthcareFacilityAssetActivityAttributes,
} from '../models/HealthcareFacilityAssetActivityModel';
import HealthcareFacilityAssetActivityRepository from '../../../domain/repositories/HealthcareFacilityAssetActivityRepository';
import { sequelize } from '../db.connection';

export default class HealthcareFacilityAssetActivityImpl
    implements HealthcareFacilityAssetActivityRepository
{
    async createHealthcareFacilityAssetActivity(
        data: HealthcareFacilityAssetActivity,
    ): Promise<void> {
        try {
            if (
                !data.createdBy ||
                !data.createdAt ||
                !data.hfAssetId ||
                !data.operatorId ||
                !data.activityType
            ) {
                throw new Error('Missing required fields for HealthcareFacilityAssetActivity');
            }
            let endDate: any = data.endDate;
            if (data.endDate === undefined) {
                endDate = null;
            }
            const createModelObj: HealthcareFacilityAssetActivityAttributes = {
                createdBy: data.createdBy,
                activityType: data.activityType,
                hfAssetId: data.hfAssetId,
                operatorId: data.operatorId,
                createdAt: data.createdAt,
                startDate: data.startDate,
                endDate: endDate,
            };

            await sequelize.query(
                `
                INSERT INTO healthcare_facility_asset_activity 
                (created_by, created_at, hf_asset_id, operator_id, activity_type, start_date, end_date)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                `,
                {
                    replacements: [
                        data.createdBy,
                        new Date(),
                        data.hfAssetId,
                        data.operatorId,
                        data.activityType,
                        data.startDate,
                        endDate,
                    ],
                    type: QueryTypes.INSERT,
                },
            );

            console.log('createModelObj:', createModelObj);
            console.log('HealthcareFacilityAssetActivity created successfully');
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                const message = error.errors.map((err) => err.message).join(', ');
                throw new Error(`Vehicle creation failed: ${message}`);
            } else if (error instanceof Error) {
                throw new Error(`Error creating HealthcareFacilityAssetActivity: ${error.message}`);
            } else {
                throw new Error(
                    'Unknown error occurred while creating HealthcareFacilityAssetActivity',
                );
            }
        }
    }

    async getAllHealthcareFacilityAssetActivity(
        limit: number = 10,
        page: number = 1,
        activityType: string | undefined = undefined,
        hfAssetId?: number,
    ): Promise<{
        data: HealthcareFacilityAssetActivity[];
        pagination: {
            total: number;
            pages: number;
            currentPage: number;
            perPage: number;
        };
    }> {
        try {
            const { limit: safeLimit, page: safePage } = paginationUtils.sanitizePaginationParams({
                limit,
                page,
            });
            const { count, rows } = await HealthcareFacilityAssetActivityModel.findAndCountAll({
                limit: safeLimit,
                offset: (safePage - 1) * safeLimit,
                order: [['created_at', 'DESC']],
                attributes: [
                    'created_by',
                    'created_at',
                    'activity_type',
                    'operator_id',
                    'hf_asset_id',
                    'start_date',
                    'end_date',
                ],
                where: {
                    ...(hfAssetId && {
                        hfAssetId: hfAssetId,
                    }),
                    ...(activityType && {
                        activityType: activityType,
                    }),
                },
            });
            return paginationUtils.formatPaginationResult(
                rows.map((m: any) => {
                    return new HealthcareFacilityAssetActivity({
                        createdBy: m.dataValues.created_by,
                        activityType: m.dataValues.activity_type,
                        operatorId: m.dataValues.operator_id,
                        hfAssetId: m.dataValues.hf_asset_id,
                        createdAt: m.dataValues.created_at,
                        startDate: m.dataValues.start_date,
                        endDate: m.dataValues.end_date,
                    });
                }),
                Number(count),
                safeLimit,
                safePage,
            );
        } catch (error) {
            console.error('Error retrieving HealthcareFacilityAssetsActivity:', error);
            throw new Error('Error retrieving HealthcareFacilityAssetsActivity');
        }
    }
}
