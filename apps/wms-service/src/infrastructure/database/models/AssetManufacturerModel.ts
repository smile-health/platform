import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface AsetManufacturerAttributes {
    id?: number;
    createdBy?: string;
    updatedBy?: string;
    name: string;
    description?: string;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface AsetManufacturerCreationAttributes extends Optional<AsetManufacturerAttributes, 'id'> {}

export class AssetManufacturerSeq extends Model<
    AsetManufacturerAttributes,
    AsetManufacturerCreationAttributes
> {}

AssetManufacturerSeq.init(
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
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        tableName: 'asset_manufacturer',
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

export default AssetManufacturerSeq;
