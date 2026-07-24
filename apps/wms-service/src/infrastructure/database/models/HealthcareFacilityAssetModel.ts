import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import AssetModelSeq from './AssetModel';

export interface HealthcareFacilityAsetAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    assetStatus: 'OPERATIONAL' | 'UNDER_MAINTAINENCE' | 'OUT_OF_SERVICE' | 'IDLE' | 'RETIRED';
    healthcareFacilityId: number;
    modelId: number;
    isIotEnabled: boolean;
    assetId: string;
    warrantyStartDate?: Date;
    warrantyEndDate?: Date;
    yearOfProduction?: number;
    assetModel?: any;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface HealthcareFacilityCreationAttributes
    extends Optional<HealthcareFacilityAsetAttributes, 'id'> {}

export class HealthcareFacilityAssetModel extends Model<
    HealthcareFacilityAsetAttributes,
    HealthcareFacilityCreationAttributes
> {}

HealthcareFacilityAssetModel.init(
    {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            primaryKey: true,
        },
        createdBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.STRING(36),
            allowNull: false,
            field: 'updated_by',
        },
        healthcareFacilityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'healthcare_facility_id',
        },
        modelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'model_id',
        },
        isIotEnabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            field: 'is_iot_enabled',
        },
        assetId: {
            type: DataTypes.STRING(32),
            allowNull: true,
            unique: false,
            field: 'asset_id',
        },
        assetStatus: {
            type: DataTypes.ENUM(
                'OPERATIONAL',
                'UNDER_MAINTAINENCE',
                'OUT_OF_SERVICE',
                'IDLE',
                'RETIRED',
            ),
            allowNull: true,
            field: 'asset_status',
        },
        warrantyStartDate: {
            type: DataTypes.DATE(),
            allowNull: true,
            field: 'warranty_start_date',
        },
        warrantyEndDate: {
            type: DataTypes.DATE(),
            allowNull: true,
            field: 'warranty_end_date',
        },
        yearOfProduction: {
            type: DataTypes.NUMBER(),
            allowNull: true,
            field: 'year_of_production',
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
        tableName: 'healthcare_facility_asset',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        sequelize,
        paranoid: true,
        deletedAt: 'deleted_at',
        indexes: [
            {
                name: 'PRIMARY',
                unique: true,
                using: 'BTREE',
                fields: [{ name: 'id' }],
            },
        ],
    },
);

HealthcareFacilityAssetModel.belongsTo(AssetModelSeq, {
    foreignKey: 'model_id',
    as: 'assetModel',
});

AssetModelSeq.hasMany(HealthcareFacilityAssetModel, {
    foreignKey: 'model_id',
    as: 'healthcareFacilityAsset',
});

export default HealthcareFacilityAssetModel;
