import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../db.connection';

export interface AsetDongleAttributes {
    assetId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    deletedBy?: number | null;
}

interface AsetDongleModelCreationAttributes extends Optional<AsetDongleAttributes, 'assetId'> {}

export class AssetDongleModel extends Model<AsetDongleAttributes, AsetDongleModelCreationAttributes> {}

AssetDongleModel.init(
    {
        assetId: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            field: 'asset_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            field: 'updated_at'
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
        tableName: 'asset_dongle',
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
                fields: [{ name: 'asset_id' }],
            },
        ],
    },
);


export default AssetDongleModel;
