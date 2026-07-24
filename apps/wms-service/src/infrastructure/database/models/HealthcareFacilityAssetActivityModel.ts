import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface HealthcareFacilityAssetActivityAttributes {
    createdBy?: string;
    createdAt: Date;
    activityType: 'MAINTENANCE' | 'CALIBRATION';
    hfAssetId: number;
    operatorId: string;
    startDate: Date;
    endDate?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface HealthcareFacilityAssetActivityCreationAttributes
    extends Optional<HealthcareFacilityAssetActivityAttributes, 'hfAssetId'> {}

export class HealthcareFacilityAssetActivityModel extends Model<
    HealthcareFacilityAssetActivityAttributes,
    HealthcareFacilityAssetActivityCreationAttributes
> {}

HealthcareFacilityAssetActivityModel.init(
    {
        createdBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'created_by',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at',
        },
        hfAssetId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'hf_asset_id',
        },
        operatorId: {
            type: DataTypes.STRING(36),
            allowNull: true,
            field: 'operator_id',
        },
        activityType: {
            type: DataTypes.ENUM('MAINTENANCE', 'CALIBRATION'),
            allowNull: true,
            field: 'activity_type',
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'start_date',
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'end_date',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
        deletedBy: {
            type: DataTypes.BIGINT,
            allowNull: true,
            field: 'deleted_by',
        },
    },
    {
        sequelize,
        tableName: 'healthcare_facility_asset_activity',
        timestamps: true,
        createdAt: false,
        updatedAt: false,
        paranoid: true,
        deletedAt: 'deleted_at',
        freezeTableName: true,
    },
);

export default HealthcareFacilityAssetActivityModel;
