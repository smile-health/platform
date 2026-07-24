import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';
import AssetManufacturerSeq from './AssetManufacturerModel';

export interface AsetModelAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    assetType: 'SCALE' | 'INCINERATOR' | 'AUTOCLAVE' | 'COLD_STORAGE';
    manufacturerId: number;
    name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface AsetModelCreationAttributes extends Optional<AsetModelAttributes, 'id'> {}

export class AssetModelSeq extends Model<AsetModelAttributes, AsetModelCreationAttributes> {}

AssetModelSeq.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
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
        assetType: {
            type: DataTypes.ENUM('SCALE', 'INCINERATOR', 'AUTOCLAVE', 'COLD_STORAGE'),
            allowNull: false,
            field: 'asset_type',
        },
        manufacturerId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'manufacturer_id',
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
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
        tableName: 'asset_model',
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

AssetModelSeq.belongsTo(AssetManufacturerSeq, {
    foreignKey: 'manufacturer_id',
    as: 'assetManufacturer',
    onDelete: 'CASCADE',
});

AssetManufacturerSeq.hasMany(AssetModelSeq, {
    foreignKey: 'manufacturer_id',
    as: 'assetModels',
});

export default AssetModelSeq;
